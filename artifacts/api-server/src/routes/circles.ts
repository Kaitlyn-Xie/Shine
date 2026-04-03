import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, circlesTable, circlePromptResponsesTable, usersTable } from "@workspace/db";
import { RespondToCirclePromptParams, RespondToCirclePromptBody } from "@workspace/api-zod";

const router: IRouter = Router();

function getSessionId(req: import("express").Request): string | null {
  const raw = req.headers["x-session-id"];
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] : raw;
}

async function getUserBySession(sessionId: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.sessionId, sessionId));
  return user ?? null;
}

async function formatCircle(circle: typeof circlesTable.$inferSelect) {
  const members = await db.select({ userId: usersTable.id, displayName: usersTable.displayName, country: usersTable.country }).from(usersTable).where(eq(usersTable.circleId, circle.id));
  const responses = await db
    .select({
      id: circlePromptResponsesTable.id,
      circleId: circlePromptResponsesTable.circleId,
      userId: circlePromptResponsesTable.userId,
      prompt: circlePromptResponsesTable.prompt,
      response: circlePromptResponsesTable.response,
      createdAt: circlePromptResponsesTable.createdAt,
      displayName: usersTable.displayName,
    })
    .from(circlePromptResponsesTable)
    .leftJoin(usersTable, eq(circlePromptResponsesTable.userId, usersTable.id))
    .where(eq(circlePromptResponsesTable.circleId, circle.id));

  return {
    ...circle,
    memberCount: members.length,
    members,
    responses: responses.map(r => ({ ...r, authorName: r.displayName ?? "Student" })),
  };
}

router.get("/circles", async (_req, res): Promise<void> => {
  const circles = await db.select().from(circlesTable).orderBy(circlesTable.id);
  const formatted = await Promise.all(circles.map(formatCircle));
  res.json(formatted);
});

router.get("/circles/me", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    res.status(400).json({ error: "x-session-id header required" });
    return;
  }
  const user = await getUserBySession(sessionId);
  if (!user || !user.circleId) {
    res.status(404).json({ error: "No circle found" });
    return;
  }
  const [circle] = await db.select().from(circlesTable).where(eq(circlesTable.id, user.circleId));
  if (!circle) {
    res.status(404).json({ error: "No circle found" });
    return;
  }
  res.json(await formatCircle(circle));
});

router.post("/circles/me", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    res.status(400).json({ error: "x-session-id header required" });
    return;
  }
  const user = await getUserBySession(sessionId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  // Find a circle with fewer than 6 members or create one
  const allCircles = await db.select().from(circlesTable);
  let targetCircle = null;
  for (const c of allCircles) {
    const members = await db.select().from(usersTable).where(eq(usersTable.circleId, c.id));
    if (members.length < 6) {
      targetCircle = c;
      break;
    }
  }
  if (!targetCircle) {
    const prompts = [
      "Share one thing you're excited about and one thing you're worried about coming to Harvard.",
      "What is something from your home country you hope to share with your new classmates?",
      "What is one question about Harvard you haven't found a good answer to yet?",
    ];
    const [newCircle] = await db.insert(circlesTable).values({
      name: `Buddy Circle ${allCircles.length + 1}`,
      currentPrompt: prompts[allCircles.length % prompts.length],
    }).returning();
    targetCircle = newCircle;
  }
  await db.update(usersTable).set({ circleId: targetCircle.id }).where(eq(usersTable.id, user.id));
  res.json(await formatCircle(targetCircle));
});

router.post("/circles/:id/prompt", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    res.status(401).json({ error: "x-session-id header required" });
    return;
  }
  const user = await getUserBySession(sessionId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = RespondToCirclePromptParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = RespondToCirclePromptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [circle] = await db.select().from(circlesTable).where(eq(circlesTable.id, params.data.id));
  if (!circle) {
    res.status(404).json({ error: "Circle not found" });
    return;
  }
  const [promptResponse] = await db
    .insert(circlePromptResponsesTable)
    .values({
      circleId: params.data.id,
      userId: user.id,
      prompt: circle.currentPrompt ?? "Icebreaker",
      response: parsed.data.response,
    })
    .returning();
  res.json({ ...promptResponse, authorName: user.pseudonym ?? user.displayName });
});

export default router;
