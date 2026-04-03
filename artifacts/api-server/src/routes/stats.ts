import { Router, type IRouter } from "express";
import { eq, desc, count } from "drizzle-orm";
import { db, usersTable, postsTable, roomsTable, submissionsTable, teamsTable, userBadgesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const [{ total: totalUsers }] = await db.select({ total: count() }).from(usersTable);
  const [{ total: totalPosts }] = await db.select({ total: count() }).from(postsTable);
  const [{ total: totalMissionsCompleted }] = await db.select({ total: count() }).from(submissionsTable);
  const [{ total: totalTeams }] = await db.select({ total: count() }).from(teamsTable);
  const [{ total: badgesAwarded }] = await db.select({ total: count() }).from(userBadgesTable);

  const rooms = await db.select({ name: roomsTable.name, postCount: roomsTable.postCount }).from(roomsTable).orderBy(desc(roomsTable.postCount)).limit(3);
  const topRooms = rooms.map(r => ({ roomName: r.name, postCount: r.postCount }));

  res.json({ totalUsers, totalPosts, totalMissionsCompleted, totalTeams, topRooms, badgesAwarded });
});

router.get("/stats/leaderboard", async (_req, res): Promise<void> => {
  const teams = await db.select().from(teamsTable).orderBy(desc(teamsTable.totalPoints)).limit(10);
  const result = await Promise.all(teams.map(async (team, i) => {
    const members = await db.select().from(usersTable).where(eq(usersTable.teamId, team.id));
    return {
      rank: i + 1,
      teamId: team.id,
      teamName: team.name,
      totalPoints: team.totalPoints,
      completedMissions: team.completedMissions,
      memberCount: members.length,
    };
  }));
  res.json(result);
});

router.get("/stats/activity", async (_req, res): Promise<void> => {
  const recentPosts = await db
    .select({ id: postsTable.id, content: postsTable.content, createdAt: postsTable.createdAt, isAnonymous: postsTable.isAnonymous, displayName: usersTable.displayName, pseudonym: usersTable.pseudonym })
    .from(postsTable)
    .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
    .orderBy(desc(postsTable.createdAt))
    .limit(5);

  const recentSubs = await db
    .select({ id: submissionsTable.id, missionId: submissionsTable.missionId, createdAt: submissionsTable.createdAt, displayName: usersTable.displayName })
    .from(submissionsTable)
    .leftJoin(usersTable, eq(submissionsTable.userId, usersTable.id))
    .orderBy(desc(submissionsTable.createdAt))
    .limit(5);

  const activity = [
    ...recentPosts.map(p => ({
      id: `post-${p.id}`,
      type: "post_created" as const,
      actorName: p.isAnonymous ? "Anonymous" : (p.pseudonym ?? p.displayName ?? "A student"),
      description: `posted in a Safe Room: "${p.content.substring(0, 80)}${p.content.length > 80 ? "..." : ""}"`,
      createdAt: p.createdAt.toISOString(),
    })),
    ...recentSubs.map(s => ({
      id: `sub-${s.id}`,
      type: "mission_completed" as const,
      actorName: s.displayName ?? "A student",
      description: `completed a scavenger hunt mission`,
      createdAt: s.createdAt.toISOString(),
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

  res.json(activity);
});

export default router;
