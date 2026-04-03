import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, teamsTable, usersTable } from "@workspace/db";
import {
  GetTeamParams,
  JoinTeamParams,
  CreateTeamBody,
} from "@workspace/api-zod";

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

async function formatTeam(team: typeof teamsTable.$inferSelect) {
  const members = await db
    .select({ userId: usersTable.id, displayName: usersTable.displayName, country: usersTable.country, totalPoints: usersTable.totalPoints })
    .from(usersTable)
    .where(eq(usersTable.teamId, team.id));
  return { ...team, memberCount: members.length, members };
}

router.get("/teams", async (_req, res): Promise<void> => {
  const teams = await db.select().from(teamsTable).orderBy(teamsTable.totalPoints);
  const formatted = await Promise.all(teams.map(formatTeam));
  res.json(formatted);
});

router.post("/teams", async (req, res): Promise<void> => {
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
  const parsed = CreateTeamBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [team] = await db.insert(teamsTable).values({ name: parsed.data.name }).returning();
  await db.update(usersTable).set({ teamId: team.id }).where(eq(usersTable.id, user.id));
  res.status(201).json(await formatTeam(team));
});

router.get("/teams/me", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    res.status(400).json({ error: "x-session-id header required" });
    return;
  }
  const user = await getUserBySession(sessionId);
  if (!user || !user.teamId) {
    res.status(404).json({ error: "Not on a team" });
    return;
  }
  const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, user.teamId));
  if (!team) {
    res.status(404).json({ error: "Team not found" });
    return;
  }
  res.json(await formatTeam(team));
});

router.get("/teams/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetTeamParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, params.data.id));
  if (!team) {
    res.status(404).json({ error: "Team not found" });
    return;
  }
  res.json(await formatTeam(team));
});

router.post("/teams/:id/join", async (req, res): Promise<void> => {
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
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = JoinTeamParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, params.data.id));
  if (!team) {
    res.status(404).json({ error: "Team not found" });
    return;
  }
  await db.update(usersTable).set({ teamId: team.id }).where(eq(usersTable.id, user.id));
  res.json(await formatTeam(team));
});

export default router;
