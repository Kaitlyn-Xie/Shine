import { Router, type IRouter } from "express";
import { eq, inArray } from "drizzle-orm";
import { db, missionsTable, submissionsTable, teamsTable, badgesTable, userBadgesTable, usersTable } from "@workspace/db";
import {
  GetMissionParams,
  SubmitMissionParams,
  SubmitMissionBody,
  ListMissionsQueryParams,
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

router.get("/missions", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const user = sessionId ? await getUserBySession(sessionId) : null;

  const queryParams = ListMissionsQueryParams.safeParse(req.query);
  const { type } = queryParams.success ? queryParams.data : {};

  let missions = await db.select().from(missionsTable).orderBy(missionsTable.id);
  if (type) {
    missions = missions.filter(m => m.type === type);
  }

  // Find completed missions for user
  let completedIds: number[] = [];
  if (user) {
    const subs = await db.select({ missionId: submissionsTable.missionId }).from(submissionsTable).where(eq(submissionsTable.userId, user.id));
    completedIds = subs.map(s => s.missionId);
  }

  res.json(missions.map(m => ({ ...m, isCompleted: completedIds.includes(m.id) })));
});

router.get("/missions/:id", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const user = sessionId ? await getUserBySession(sessionId) : null;

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetMissionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [mission] = await db.select().from(missionsTable).where(eq(missionsTable.id, params.data.id));
  if (!mission) {
    res.status(404).json({ error: "Mission not found" });
    return;
  }
  let isCompleted = false;
  if (user) {
    const [sub] = await db.select().from(submissionsTable).where(eq(submissionsTable.userId, user.id));
    isCompleted = sub?.missionId === mission.id;
  }
  res.json({ ...mission, isCompleted });
});

router.post("/missions/:id/submit", async (req, res): Promise<void> => {
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
  const params = SubmitMissionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = SubmitMissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [mission] = await db.select().from(missionsTable).where(eq(missionsTable.id, params.data.id));
  if (!mission) {
    res.status(404).json({ error: "Mission not found" });
    return;
  }

  const [submission] = await db
    .insert(submissionsTable)
    .values({
      missionId: mission.id,
      userId: user.id,
      teamId: parsed.data.teamId ?? null,
      reflection: parsed.data.reflection,
      photoUrl: parsed.data.photoUrl ?? null,
      pointsEarned: mission.points,
    })
    .returning();

  // Award points to user
  await db.update(usersTable).set({ totalPoints: user.totalPoints + mission.points }).where(eq(usersTable.id, user.id));

  // Award points to team
  if (parsed.data.teamId) {
    const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, parsed.data.teamId));
    if (team) {
      await db.update(teamsTable).set({
        totalPoints: team.totalPoints + mission.points,
        completedMissions: team.completedMissions + 1,
      }).where(eq(teamsTable.id, team.id));
    }
  }

  // Award badge if mission has one
  if (mission.badgeId) {
    const existing = await db.select().from(userBadgesTable).where(eq(userBadgesTable.userId, user.id));
    if (!existing.find(b => b.badgeId === mission.badgeId)) {
      await db.insert(userBadgesTable).values({ userId: user.id, badgeId: mission.badgeId! });
    }
  }

  res.status(201).json(submission);
});

export default router;
