import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  UpdateMeBody,
  OnboardUserBody,
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

router.get("/users/me", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    res.status(400).json({ error: "x-session-id header required" });
    return;
  }
  const user = await getUserBySession(sessionId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.put("/users/me", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    res.status(400).json({ error: "x-session-id header required" });
    return;
  }
  const user = await getUserBySession(sessionId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, user.id))
    .returning();
  res.json(updated);
});

router.post("/users/onboard", async (req, res): Promise<void> => {
  const parsed = OnboardUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const existing = await getUserBySession(parsed.data.sessionId);
  if (existing) {
    const [updated] = await db
      .update(usersTable)
      .set({ ...parsed.data, onboardingCompleted: true })
      .where(eq(usersTable.id, existing.id))
      .returning();
    res.status(201).json(updated);
    return;
  }
  const [user] = await db
    .insert(usersTable)
    .values({ ...parsed.data, onboardingCompleted: true })
    .returning();
  res.status(201).json(user);
});

router.get("/users/me/prep-path", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    res.status(400).json({ error: "x-session-id header required" });
    return;
  }
  const user = await getUserBySession(sessionId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const milestones = [
    { id: "ac-1", category: "Academics", title: "Learn about U.S. classroom norms", description: "Read the guide on participation, office hours, and p-sets.", completed: false, priority: 1 },
    { id: "ac-2", category: "Academics", title: "Understand course selection strategy", description: "Read the hidden curriculum guide on back-to-back classes and workload balance.", completed: false, priority: 2 },
    { id: "ac-3", category: "Academics", title: "Learn p-set collaboration rules", description: "Understand what is and isn't allowed when working with peers on problem sets.", completed: false, priority: 3 },
    { id: "fi-1", category: "Finances", title: "Understand what financial aid covers", description: "Learn what full financial aid does and does not include (laundry, toiletries, flights).", completed: false, priority: 4 },
    { id: "fi-2", category: "Finances", title: "Learn about break housing options", description: "Find out what happens with housing during winter and spring breaks.", completed: false, priority: 5 },
    { id: "fi-3", category: "Finances", title: "Explore summer funding", description: "Research funding options for summer and visa constraints on work.", completed: false, priority: 6 },
    { id: "mh-1", category: "Well-being", title: "Introduction to mental health support", description: "Learn about counseling services and what seeking help actually looks like.", completed: false, priority: 7 },
    { id: "mh-2", category: "Well-being", title: "Build a self-care habit", description: "Identify one daily habit that keeps you grounded during a busy semester.", completed: false, priority: 8 },
    { id: "so-1", category: "Social Life", title: "Explore clubs and student orgs", description: "Browse what's available and understand the club comp process.", completed: false, priority: 9 },
    { id: "so-2", category: "Social Life", title: "Join a buddy circle", description: "Connect with 3–6 other international students before arrival.", completed: user.circleId != null, priority: 10 },
    { id: "ca-1", category: "Career", title: "Understand visa and work limits", description: "Learn what CPT/OPT means and what kinds of jobs you can legally hold.", completed: false, priority: 11 },
    { id: "ca-2", category: "Career", title: "Explore international-friendly internships", description: "Find out how to navigate summer internships as an international student.", completed: false, priority: 12 },
  ];

  const completedCount = milestones.filter(m => m.completed).length;
  res.json({ userId: user.id, milestones, completedCount, totalCount: milestones.length });
});

router.get("/users/me/badges", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    res.status(400).json({ error: "x-session-id header required" });
    return;
  }
  const user = await getUserBySession(sessionId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const { userBadgesTable, badgesTable } = await import("@workspace/db");
  const rows = await db
    .select({ badge: badgesTable, earnedAt: userBadgesTable.earnedAt })
    .from(userBadgesTable)
    .leftJoin(badgesTable, eq(userBadgesTable.badgeId, badgesTable.id))
    .where(eq(userBadgesTable.userId, user.id));
  const result = rows
    .filter(r => r.badge != null)
    .map(r => ({ badge: r.badge!, earnedAt: r.earnedAt.toISOString() }));
  res.json(result);
});

export default router;
