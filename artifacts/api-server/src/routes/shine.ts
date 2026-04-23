import { Router, type IRouter } from "express";
import { eq, desc, and, inArray } from "drizzle-orm";
import { scryptSync, randomBytes, randomUUID } from "crypto";
import {
  db,
  shineUsersTable,
  shineFeedPostsTable,
  shineSunlightPostsTable,
  shineHuntCompletionsTable,
  shineQuestionAnswersTable,
  shineMatchMissionsTable,
  shineMissionParticipantsTable,
  shineMatchGroupsTable,
  shineMatchQueueTable,
  shineMatchGroupMessagesTable,
} from "@workspace/db";

const router: IRouter = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const hashToVerify = scryptSync(password, salt, 32).toString("hex");
  return hash === hashToVerify;
}

function getSessionId(req: import("express").Request): string | null {
  const raw = req.headers["x-session-id"];
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] : raw;
}

async function getShineUser(sessionToken: string) {
  const [user] = await db
    .select()
    .from(shineUsersTable)
    .where(eq(shineUsersTable.sessionToken, sessionToken));
  return user ?? null;
}

function sanitizeUser(user: typeof shineUsersTable.$inferSelect) {
  // hiddenJournal is private — never expose in public-facing responses
  const { passwordHash, sessionToken, hiddenJournal, ...safe } = user;
  return safe;
}

function sanitizeUserPublic(user: typeof shineUsersTable.$inferSelect) {
  // For other-user views: also strip isScavengerOptIn and other private fields
  const { passwordHash, sessionToken, hiddenJournal, isScavengerOptIn, ...safe } = user;
  return safe;
}

function formatTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function toInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function adaptFeedPost(post: typeof shineFeedPostsTable.$inferSelect) {
  return {
    id: post.id,
    userId: post.userId,
    username: post.username,
    text: post.text,
    img: post.img ?? null,
    mediaType: post.mediaType ?? "photo",
    textContent: post.textContent ?? null,
    gradientIdx: post.gradientIdx ?? 0,
    location:
      post.locationLat != null && post.locationLng != null
        ? {
            lat: post.locationLat,
            lng: post.locationLng,
            name: post.locationName ?? "Campus",
          }
        : null,
    isHunt: post.isHunt,
    likes: post.likes,
    time: formatTime(post.createdAt),
    photoUrl: post.img ?? null,
    missionTitle: post.text,
    createdAt: post.createdAt.toISOString(),
  };
}

function adaptSunlightPost(post: typeof shineSunlightPostsTable.$inferSelect) {
  const displayName = post.isAnonymous ? "Anonymous" : post.username;
  return {
    id: `db-${post.id}`,
    dbId: post.id,
    userId: post.userId,
    type: post.type,
    title: post.title,
    body: post.body,
    location:
      post.locationLat != null && post.locationLng != null
        ? {
            lat: post.locationLat,
            lng: post.locationLng,
            label: post.locationLabel ?? "Campus",
          }
        : null,
    username: displayName,
    initials: post.isAnonymous ? null : toInitials(post.username),
    isAnonymous: post.isAnonymous,
    avatarBg: "linear-gradient(135deg, #FFC94A, #FF9A3C)",
    likes: post.likes,
    comments: 0,
    time: formatTime(post.createdAt),
    createdAt: post.createdAt.toISOString(),
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

router.post("/shine/auth/signup", async (req, res): Promise<void> => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6) {
    res
      .status(400)
      .json({ error: "name, email, and password (min 6 chars) are required" });
    return;
  }

  const existing = await db
    .select()
    .from(shineUsersTable)
    .where(eq(shineUsersTable.email, email.toLowerCase().trim()))
    .limit(1);
  if (existing.length > 0) {
    res
      .status(409)
      .json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = hashPassword(password);
  const sessionToken = randomUUID();

  const [user] = await db
    .insert(shineUsersTable)
    .values({
      email: email.toLowerCase().trim(),
      passwordHash,
      sessionToken,
      name: name.trim(),
    })
    .returning();

  res.status(201).json({ user: sanitizeUser(user), sessionToken });
});

router.post("/shine/auth/signin", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const [user] = await db
    .select()
    .from(shineUsersTable)
    .where(eq(shineUsersTable.email, email.toLowerCase().trim()))
    .limit(1);

  if (!user) {
    res
      .status(401)
      .json({
        error:
          "No account found with that email. Please sign up.",
      });
    return;
  }

  if (!verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Incorrect password." });
    return;
  }

  const sessionToken = randomUUID();
  const [updated] = await db
    .update(shineUsersTable)
    .set({ sessionToken })
    .where(eq(shineUsersTable.id, user.id))
    .returning();

  res.json({ user: sanitizeUser(updated), sessionToken });
});

// ── User ──────────────────────────────────────────────────────────────────────

router.get("/shine/users/me", async (req, res): Promise<void> => {
  const tok = getSessionId(req);
  if (!tok) { res.status(401).json({ error: "Not authenticated" }); return; }
  const user = await getShineUser(tok);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(sanitizeUser(user));
});

router.put("/shine/users/me", async (req, res): Promise<void> => {
  const tok = getSessionId(req);
  if (!tok) { res.status(401).json({ error: "Not authenticated" }); return; }
  const user = await getShineUser(tok);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const {
    name, country, year, concentration, dorm, house,
    interests, isOnCampus, onboarded,
  } = req.body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (country !== undefined) updates.country = country;
  if (year !== undefined) updates.year = year;
  if (concentration !== undefined) updates.concentration = concentration;
  if (dorm !== undefined) updates.dorm = dorm;
  if (house !== undefined) updates.dorm = house;
  if (interests !== undefined) updates.interests = interests;
  if (isOnCampus !== undefined) updates.isOnCampus = isOnCampus;
  if (onboarded !== undefined) updates.onboarded = onboarded;

  const [updated] = await db
    .update(shineUsersTable)
    .set(updates)
    .where(eq(shineUsersTable.id, user.id))
    .returning();

  res.json(sanitizeUser(updated));
});

// ── Feed Posts ────────────────────────────────────────────────────────────────

router.get("/shine/feed-posts", async (req, res): Promise<void> => {
  const posts = await db
    .select()
    .from(shineFeedPostsTable)
    .orderBy(desc(shineFeedPostsTable.createdAt))
    .limit(100);
  res.json(posts.map(adaptFeedPost));
});

router.post("/shine/feed-posts", async (req, res): Promise<void> => {
  const tok = getSessionId(req);
  if (!tok) { res.status(401).json({ error: "Not authenticated" }); return; }
  const user = await getShineUser(tok);
  if (!user) { res.status(401).json({ error: "User not found" }); return; }

  const { text, img, mediaType, textContent, gradientIdx, locationName, locationLat, locationLng } = req.body;
  if (!text && !textContent) {
    res.status(400).json({ error: "Post must have text content" });
    return;
  }

  const [post] = await db
    .insert(shineFeedPostsTable)
    .values({
      userId: user.id,
      username: user.name,
      text: text ?? "",
      img: img ?? null,
      mediaType: mediaType ?? null,
      textContent: textContent ?? null,
      gradientIdx: gradientIdx ?? null,
      locationName: locationName ?? null,
      locationLat: locationLat ?? null,
      locationLng: locationLng ?? null,
      isHunt: false,
    })
    .returning();

  res.status(201).json(adaptFeedPost(post));
});

router.post("/shine/feed-posts/:id/like", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [post] = await db
    .select()
    .from(shineFeedPostsTable)
    .where(eq(shineFeedPostsTable.id, id));
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }
  const [updated] = await db
    .update(shineFeedPostsTable)
    .set({ likes: post.likes + 1 })
    .where(eq(shineFeedPostsTable.id, id))
    .returning();
  res.json(adaptFeedPost(updated));
});

// ── Sunlight Posts ────────────────────────────────────────────────────────────

router.get("/shine/sunlight-posts", async (req, res): Promise<void> => {
  const posts = await db
    .select()
    .from(shineSunlightPostsTable)
    .orderBy(desc(shineSunlightPostsTable.createdAt))
    .limit(200);
  res.json(posts.map(adaptSunlightPost));
});

router.post("/shine/sunlight-posts", async (req, res): Promise<void> => {
  const tok = getSessionId(req);
  if (!tok) { res.status(401).json({ error: "Not authenticated" }); return; }
  const user = await getShineUser(tok);
  if (!user) { res.status(401).json({ error: "User not found" }); return; }

  const { type, title, body, locationLat, locationLng, locationLabel, isAnonymous } = req.body;
  if (!title || !body || !type) {
    res.status(400).json({ error: "type, title, and body are required" });
    return;
  }

  const [post] = await db
    .insert(shineSunlightPostsTable)
    .values({
      userId: user.id,
      username: user.name,
      type,
      title,
      body,
      locationLat: locationLat ?? null,
      locationLng: locationLng ?? null,
      locationLabel: locationLabel ?? null,
      isAnonymous: isAnonymous === true,
    })
    .returning();

  res.status(201).json(adaptSunlightPost(post));
});

router.put("/shine/sunlight-posts/:id", async (req, res): Promise<void> => {
  const tok = getSessionId(req);
  if (!tok) { res.status(401).json({ error: "Not authenticated" }); return; }
  const user = await getShineUser(tok);
  if (!user) { res.status(401).json({ error: "User not found" }); return; }

  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid post id" }); return; }

  const [existing] = await db
    .select()
    .from(shineSunlightPostsTable)
    .where(eq(shineSunlightPostsTable.id, id))
    .limit(1);

  if (!existing) { res.status(404).json({ error: "Post not found" }); return; }
  if (existing.userId !== user.id) { res.status(403).json({ error: "Not your post" }); return; }

  const { title, body, isAnonymous } = req.body;
  if (!title || !body) { res.status(400).json({ error: "title and body are required" }); return; }

  const [updated] = await db
    .update(shineSunlightPostsTable)
    .set({
      title: title.trim(),
      body: body.trim(),
      isAnonymous: isAnonymous === true,
      username: isAnonymous ? existing.username : user.name,
    })
    .where(eq(shineSunlightPostsTable.id, id))
    .returning();

  res.json(adaptSunlightPost(updated));
});

router.post(
  "/shine/sunlight-posts/:id/like",
  async (req, res): Promise<void> => {
    const id = parseInt(req.params.id as string, 10);
    const [post] = await db
      .select()
      .from(shineSunlightPostsTable)
      .where(eq(shineSunlightPostsTable.id, id));
    if (!post) { res.status(404).json({ error: "Post not found" }); return; }
    const [updated] = await db
      .update(shineSunlightPostsTable)
      .set({ likes: post.likes + 1 })
      .where(eq(shineSunlightPostsTable.id, id))
      .returning();
    res.json(adaptSunlightPost(updated));
  },
);

// ── Question Answers ──────────────────────────────────────────────────────────

router.get(
  "/shine/sunlight-posts/:id/answers",
  async (req, res): Promise<void> => {
    const id = parseInt(req.params.id as string, 10);
    const rows = await db
      .select()
      .from(shineQuestionAnswersTable)
      .where(eq(shineQuestionAnswersTable.questionId, id))
      .orderBy(shineQuestionAnswersTable.createdAt);
    res.json(
      rows.map((a) => ({
        id: a.id,
        username: a.isAnonymous ? "Anonymous" : a.username,
        isAnonymous: a.isAnonymous,
        body: a.body,
        likes: a.likes,
        time: formatTime(a.createdAt),
        createdAt: a.createdAt.toISOString(),
      })),
    );
  },
);

router.post(
  "/shine/sunlight-posts/:id/answers",
  async (req, res): Promise<void> => {
    const tok = getSessionId(req);
    if (!tok) { res.status(401).json({ error: "Not authenticated" }); return; }
    const user = await getShineUser(tok);
    if (!user) { res.status(401).json({ error: "User not found" }); return; }

    const questionId = parseInt(req.params.id as string, 10);
    const { body, isAnonymous } = req.body;
    if (!body || !body.trim()) {
      res.status(400).json({ error: "body is required" });
      return;
    }

    const [answer] = await db
      .insert(shineQuestionAnswersTable)
      .values({
        questionId,
        userId: user.id,
        username: user.name,
        body: body.trim(),
        isAnonymous: isAnonymous === true,
      })
      .returning();

    res.status(201).json({
      id: answer.id,
      username: answer.isAnonymous ? "Anonymous" : answer.username,
      isAnonymous: answer.isAnonymous,
      body: answer.body,
      likes: answer.likes,
      time: "Just now",
      createdAt: answer.createdAt.toISOString(),
    });
  },
);

// ── Hunt ──────────────────────────────────────────────────────────────────────

router.get("/shine/hunt/stats", async (req, res): Promise<void> => {
  const tok = getSessionId(req);
  if (!tok) { res.status(401).json({ error: "Not authenticated" }); return; }
  const user = await getShineUser(tok);
  if (!user) { res.status(401).json({ error: "User not found" }); return; }

  const completions = await db
    .select()
    .from(shineHuntCompletionsTable)
    .where(eq(shineHuntCompletionsTable.userId, user.id))
    .orderBy(desc(shineHuntCompletionsTable.createdAt));

  const totalPoints = completions.reduce((sum, c) => sum + c.ptsTotal, 0);
  const completedMissionIds = completions.map((c) => c.missionId);

  res.json({
    completions: completions.map((c) => ({
      id: c.id,
      missionId: c.missionId,
      missionTitle: c.missionTitle,
      pts: c.ptsTotal,
      ptsTotal: c.ptsTotal,
      photoUrl: c.photoUrl ?? null,
      shareToFeed: c.shareToFeed,
      time: formatTime(c.createdAt),
      createdAt: c.createdAt.toISOString(),
    })),
    totalPoints,
    completedMissionIds,
  });
});

router.post("/shine/hunt/complete", async (req, res): Promise<void> => {
  const tok = getSessionId(req);
  if (!tok) { res.status(401).json({ error: "Not authenticated" }); return; }
  const user = await getShineUser(tok);
  if (!user) { res.status(401).json({ error: "User not found" }); return; }

  const { missionId, missionTitle, ptsTotal, photoUrl, shareToFeed } = req.body;
  if (!missionId) {
    res.status(400).json({ error: "missionId is required" });
    return;
  }

  const existing = await db
    .select()
    .from(shineHuntCompletionsTable)
    .where(
      and(
        eq(shineHuntCompletionsTable.userId, user.id),
        eq(shineHuntCompletionsTable.missionId, missionId),
      ),
    );

  if (existing.length > 0) {
    res.status(409).json({ error: "Mission already completed" });
    return;
  }

  const [completion] = await db
    .insert(shineHuntCompletionsTable)
    .values({
      userId: user.id,
      missionId,
      missionTitle: missionTitle ?? missionId,
      ptsTotal: ptsTotal ?? 0,
      photoUrl: photoUrl ?? null,
      shareToFeed: shareToFeed ?? false,
    })
    .returning();

  if (shareToFeed && photoUrl) {
    await db.insert(shineFeedPostsTable).values({
      userId: user.id,
      username: user.name,
      text: `Completed mission: ${missionTitle ?? missionId}! 🗺️`,
      img: photoUrl,
      mediaType: "photo",
      isHunt: true,
    });
  }

  res.status(201).json({
    id: completion.id,
    missionId: completion.missionId,
    missionTitle: completion.missionTitle,
    pts: completion.ptsTotal,
    ptsTotal: completion.ptsTotal,
    photoUrl: completion.photoUrl ?? null,
    shareToFeed: completion.shareToFeed,
    time: "Just now",
    createdAt: completion.createdAt.toISOString(),
  });
});

// ── Leaderboard ───────────────────────────────────────────────────────────────

router.get("/shine/hunt/leaderboard", async (req, res): Promise<void> => {
  // Fetch all registered users and all completions in parallel
  const [allUsers, completions] = await Promise.all([
    db.select({ id: shineUsersTable.id, name: shineUsersTable.name, dorm: shineUsersTable.dorm, country: shineUsersTable.country })
      .from(shineUsersTable),
    db.select().from(shineHuntCompletionsTable),
  ]);

  // Sum points and mission count per user (default 0 for users with no completions)
  const userMap: Record<number, { pts: number; missions: number }> = {};
  for (const u of allUsers) {
    userMap[u.id] = { pts: 0, missions: 0 };
  }
  for (const c of completions) {
    if (userMap[c.userId]) {
      userMap[c.userId].pts += c.ptsTotal;
      userMap[c.userId].missions += 1;
    }
  }

  const leaderboard = allUsers
    .map(u => ({
      userId: u.id,
      name: u.name || "Anonymous",
      dorm: u.dorm ?? null,
      country: u.country ?? null,
      pts: userMap[u.id]?.pts ?? 0,
      missions: userMap[u.id]?.missions ?? 0,
    }))
    .sort((a, b) => b.pts - a.pts || a.name.localeCompare(b.name))
    .slice(0, 50);

  res.json(leaderboard);
});

// ── Hidden Journal ────────────────────────────────────────────────────────────

// GET own hidden journal — only accessible by the authenticated user themselves
router.get("/shine/profile/hidden-journal", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  res.json({ hiddenJournal: user.hiddenJournal ?? "" });
});

// PUT update own hidden journal
router.put("/shine/profile/hidden-journal", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { hiddenJournal } = req.body;
  if (typeof hiddenJournal !== "string") {
    res.status(400).json({ error: "hiddenJournal must be a string" }); return;
  }

  await db
    .update(shineUsersTable)
    .set({ hiddenJournal: hiddenJournal.trim() || null })
    .where(eq(shineUsersTable.id, user.id));

  res.json({ ok: true });
});

// ── Scavenger Hunt Opt-In ─────────────────────────────────────────────────────

router.post("/shine/scavenger/opt-in", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const optIn = req.body?.optIn;
  if (typeof optIn !== "boolean") {
    res.status(400).json({ error: "optIn (boolean) is required" }); return;
  }

  await db
    .update(shineUsersTable)
    .set({ isScavengerOptIn: optIn })
    .where(eq(shineUsersTable.id, user.id));

  res.json({ ok: true, isScavengerOptIn: optIn });
});

// ── Matching Queue ────────────────────────────────────────────────────────────

// Join the global matching queue
router.post("/shine/scavenger/queue", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  // Block if user has an active (non-completed) match group
  const allGroups = await db.select().from(shineMatchGroupsTable);
  const activeGroup = allGroups.find(g =>
    g.memberIds.split(",").map(Number).includes(user.id) &&
    g.status !== "completed"
  );
  if (activeGroup) {
    res.status(409).json({
      error: "active_group",
      message: "Complete your current mission first before joining a new match.",
      groupId: activeGroup.id,
    });
    return;
  }

  await db
    .insert(shineMatchQueueTable)
    .values({ userId: user.id })
    .onConflictDoNothing();

  // Count queue members
  const queue = await db.select().from(shineMatchQueueTable);
  res.json({ ok: true, queueSize: queue.length });
});

// Leave the matching queue
router.delete("/shine/scavenger/queue", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  await db.delete(shineMatchQueueTable).where(eq(shineMatchQueueTable.userId, user.id));
  res.json({ ok: true });
});

// Get queue status (count + whether current user is in queue)
router.get("/shine/scavenger/queue/status", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const queue = await db.select().from(shineMatchQueueTable);
  // Remove stale entries from count
  const existingGroups = await db.select().from(shineMatchGroupsTable);
  const alreadyGrouped = new Set(existingGroups.flatMap(g => g.memberIds.split(",").map(Number)));
  const activeQueue = queue.filter(q => !alreadyGrouped.has(q.userId));
  const inQueue = activeQueue.some(q => q.userId === user.id);
  res.json({ queueSize: activeQueue.length, inQueue });
});

// ── Available Missions (for groups to choose from) ───────────────────────────

router.get("/shine/scavenger/missions", async (req, res): Promise<void> => {
  const missions = await db
    .select()
    .from(shineMatchMissionsTable)
    .where(eq(shineMatchMissionsTable.isActive, true))
    .orderBy(shineMatchMissionsTable.id);

  res.json(missions);
});

// ── My Groups ─────────────────────────────────────────────────────────────────

router.get("/shine/scavenger/my-groups", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const allGroups = await db
    .select()
    .from(shineMatchGroupsTable)
    .orderBy(desc(shineMatchGroupsTable.createdAt));

  const myGroups = allGroups.filter(g => {
    const ids = g.memberIds.split(",").map(Number);
    return ids.includes(user.id);
  });

  if (myGroups.length === 0) { res.json([]); return; }

  const allMemberIds = [...new Set(myGroups.flatMap(g => g.memberIds.split(",").map(Number)))];
  const allMembers = await db
    .select({ id: shineUsersTable.id, name: shineUsersTable.name, country: shineUsersTable.country, year: shineUsersTable.year })
    .from(shineUsersTable)
    .where(inArray(shineUsersTable.id, allMemberIds));
  const memberMap: Record<number, { id: number; name: string; country: string | null; year: string | null }> = {};
  for (const m of allMembers) memberMap[m.id] = m;

  // Get latest message for each group (chat preview)
  const groupIds = myGroups.map(g => g.id);
  const allMessages = await db
    .select()
    .from(shineMatchGroupMessagesTable)
    .where(inArray(shineMatchGroupMessagesTable.groupId, groupIds))
    .orderBy(desc(shineMatchGroupMessagesTable.createdAt));

  const latestByGroup: Record<number, typeof shineMatchGroupMessagesTable.$inferSelect> = {};
  for (const msg of allMessages) {
    if (!latestByGroup[msg.groupId]) latestByGroup[msg.groupId] = msg;
  }

  const result = myGroups.map(g => ({
    id: g.id,
    members: g.memberIds.split(",").map(Number).map(id => memberMap[id] ?? { id, name: "Unknown" }),
    matchingSummary: g.matchingSummary,
    chosenMissionId: g.chosenMissionId,
    chosenMissionTitle: g.chosenMissionTitle,
    status: g.status,
    latestMessage: latestByGroup[g.id]
      ? { content: latestByGroup[g.id].content, senderName: latestByGroup[g.id].senderName, messageType: latestByGroup[g.id].messageType }
      : null,
    createdAt: g.createdAt.toISOString(),
  }));

  res.json(result);
});

// ── Check queue/match status ───────────────────────────────────────────────────

router.get("/shine/scavenger/my-participation", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const [queueRow] = await db
    .select()
    .from(shineMatchQueueTable)
    .where(eq(shineMatchQueueTable.userId, user.id));

  const totalQueue = await db.select().from(shineMatchQueueTable);

  // Check for an active (non-completed) match group
  const allGroups = await db.select().from(shineMatchGroupsTable);
  const activeGroup = allGroups.find(g =>
    g.memberIds.split(",").map(Number).includes(user.id) &&
    g.status !== "completed"
  );

  res.json({
    isScavengerOptIn: user.isScavengerOptIn,
    inQueue: !!queueRow,
    queueSize: totalQueue.length,
    joinedAt: queueRow?.joinedAt?.toISOString() ?? null,
    hasActiveGroup: !!activeGroup,
    activeGroupId: activeGroup?.id ?? null,
    activeGroupStatus: activeGroup?.status ?? null,
    activeGroupMissionTitle: activeGroup?.chosenMissionTitle ?? null,
  });
});

// ── Group Chat ────────────────────────────────────────────────────────────────

// Get all messages for a group
router.get("/shine/scavenger/groups/:id/chat", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const groupId = parseInt(req.params.id, 10);
  if (isNaN(groupId)) { res.status(400).json({ error: "Invalid group id" }); return; }

  // Verify membership
  const [group] = await db.select().from(shineMatchGroupsTable).where(eq(shineMatchGroupsTable.id, groupId));
  if (!group) { res.status(404).json({ error: "Group not found" }); return; }
  const memberIds = group.memberIds.split(",").map(Number);
  if (!memberIds.includes(user.id)) { res.status(403).json({ error: "Not a member of this group" }); return; }

  const messages = await db
    .select()
    .from(shineMatchGroupMessagesTable)
    .where(eq(shineMatchGroupMessagesTable.groupId, groupId))
    .orderBy(shineMatchGroupMessagesTable.createdAt);

  res.json(messages.map(m => ({
    id: m.id,
    userId: m.userId,
    senderName: m.senderName,
    content: m.content,
    messageType: m.messageType,
    isMe: m.userId === user.id,
    createdAt: m.createdAt.toISOString(),
  })));
});

// Send a message in a group chat
router.post("/shine/scavenger/groups/:id/chat", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const groupId = parseInt(req.params.id, 10);
  if (isNaN(groupId)) { res.status(400).json({ error: "Invalid group id" }); return; }

  const content = req.body?.content?.trim();
  if (!content) { res.status(400).json({ error: "content is required" }); return; }

  // Verify membership
  const [group] = await db.select().from(shineMatchGroupsTable).where(eq(shineMatchGroupsTable.id, groupId));
  if (!group) { res.status(404).json({ error: "Group not found" }); return; }
  const memberIds = group.memberIds.split(",").map(Number);
  if (!memberIds.includes(user.id)) { res.status(403).json({ error: "Not a member of this group" }); return; }

  const [msg] = await db
    .insert(shineMatchGroupMessagesTable)
    .values({ groupId, userId: user.id, senderName: user.name, content, messageType: "user" })
    .returning();

  res.json({ ok: true, message: { id: msg.id, senderName: msg.senderName, content: msg.content, messageType: msg.messageType, isMe: true, createdAt: msg.createdAt.toISOString() } });
});

// ── Choose Mission (group decision) ──────────────────────────────────────────

router.post("/shine/scavenger/groups/:id/choose-mission", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const groupId = parseInt(req.params.id, 10);
  if (isNaN(groupId)) { res.status(400).json({ error: "Invalid group id" }); return; }

  const { missionId, missionTitle } = req.body ?? {};
  if (!missionId || !missionTitle) { res.status(400).json({ error: "missionId and missionTitle are required" }); return; }

  // Verify membership
  const [group] = await db.select().from(shineMatchGroupsTable).where(eq(shineMatchGroupsTable.id, groupId));
  if (!group) { res.status(404).json({ error: "Group not found" }); return; }
  const memberIds = group.memberIds.split(",").map(Number);
  if (!memberIds.includes(user.id)) { res.status(403).json({ error: "Not a member of this group" }); return; }

  // Block if any group member has already completed this mission
  const prior = await db
    .select({ userId: shineHuntCompletionsTable.userId })
    .from(shineHuntCompletionsTable)
    .where(
      and(
        eq(shineHuntCompletionsTable.missionId, String(missionId)),
        inArray(shineHuntCompletionsTable.userId, memberIds)
      )
    );
  if (prior.length > 0) {
    res.status(409).json({ error: "This mission has already been completed by a group member. Please choose a different one." });
    return;
  }

  // Update the group
  await db
    .update(shineMatchGroupsTable)
    .set({ chosenMissionId: String(missionId), chosenMissionTitle: missionTitle, status: "mission_chosen" })
    .where(eq(shineMatchGroupsTable.id, groupId));

  // Post a system message in the chat
  await db.insert(shineMatchGroupMessagesTable).values({
    groupId,
    userId: null,
    senderName: "SHINE",
    content: `🗺️ Your group has chosen: **${missionTitle}**! Get together and complete the mission. You'll earn bonus points as a matched group. Good luck!`,
    messageType: "system",
  });

  res.json({ ok: true, chosenMissionId: String(missionId), chosenMissionTitle: missionTitle });
});

// ── Group Mission Completion ──────────────────────────────────────────────────

// POST /scavenger/groups/:id/complete-mission
// Records completion for ALL group members, optionally posts to the community feed,
// and seeds a celebration system message in the group chat.
router.post("/shine/scavenger/groups/:id/complete-mission", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const groupId = parseInt(req.params.id, 10);
  if (isNaN(groupId)) { res.status(400).json({ error: "Invalid group id" }); return; }

  const { photoUrl, caption, shareToFeed, ptsTotal, locationLat, locationLng, locationName } = req.body ?? {};
  if (!photoUrl) { res.status(400).json({ error: "photoUrl is required" }); return; }

  // Verify membership + mission chosen
  const [group] = await db.select().from(shineMatchGroupsTable).where(eq(shineMatchGroupsTable.id, groupId));
  if (!group) { res.status(404).json({ error: "Group not found" }); return; }
  const memberIds = group.memberIds.split(",").map(Number);
  if (!memberIds.includes(user.id)) { res.status(403).json({ error: "Not a member of this group" }); return; }
  if (!group.chosenMissionId || !group.chosenMissionTitle) {
    res.status(400).json({ error: "Group has not chosen a mission yet" }); return;
  }

  const missionId = group.chosenMissionId;
  const missionTitle = group.chosenMissionTitle;
  const totalPts = ptsTotal ?? 0;

  // Award completion to every group member (skip if already completed this mission)
  const completedMembers: number[] = [];
  for (const memberId of memberIds) {
    const existing = await db
      .select()
      .from(shineHuntCompletionsTable)
      .where(and(eq(shineHuntCompletionsTable.userId, memberId), eq(shineHuntCompletionsTable.missionId, missionId)));
    if (existing.length === 0) {
      await db.insert(shineHuntCompletionsTable).values({
        userId: memberId,
        missionId,
        missionTitle,
        ptsTotal: totalPts,
        photoUrl: photoUrl ?? null,
        shareToFeed: !!(shareToFeed && memberId === user.id),
      });
      completedMembers.push(memberId);
    }
  }

  // Create a single community feed post (from the submitter)
  if (shareToFeed && photoUrl) {
    const postText = caption?.trim()
      ? `${caption.trim()}\n\n🤖 AI Match group completed: ${missionTitle}!`
      : `🤖 AI Match group completed: ${missionTitle}! Our matched group of ${memberIds.length} explored Harvard together. ✨`;
    await db.insert(shineFeedPostsTable).values({
      userId: user.id,
      username: user.name,
      text: postText,
      img: photoUrl,
      mediaType: "photo",
      isHunt: true,
      locationLat: locationLat ?? null,
      locationLng: locationLng ?? null,
      locationName: locationName ?? null,
    });
  }

  // Mark group as completed
  await db.update(shineMatchGroupsTable)
    .set({ status: "completed" })
    .where(eq(shineMatchGroupsTable.id, groupId));

  // Post celebration system message in group chat
  const memberNames = (await db
    .select({ name: shineUsersTable.name })
    .from(shineUsersTable)
    .where(inArray(shineUsersTable.id, memberIds))
  ).map(u => u.name.split(" ")[0]).join(", ");

  await db.insert(shineMatchGroupMessagesTable).values({
    groupId,
    userId: null,
    senderName: "SHINE",
    content: `🎉 Mission complete! **${missionTitle}** has been verified for ${memberNames}. Each member earned **${totalPts} points** — including the AI Match bonus. ${shareToFeed ? "Your group photo has been posted to the community feed!" : ""} Amazing teamwork! 🌟`,
    messageType: "system",
  });

  res.status(201).json({
    ok: true,
    missionId,
    missionTitle,
    ptsTotal: totalPts,
    completedMembers,
    postedToFeed: !!(shareToFeed && photoUrl),
  });
});

// ── AI Matching (global queue) ────────────────────────────────────────────────

async function callOpenAI(prompt: string): Promise<string> {
  const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key not configured");

  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
      temperature: 0.4,
    }),
  });
  const data = (await resp.json()) as any;
  return data?.choices?.[0]?.message?.content ?? "";
}

function tokenize(text: string): Set<string> {
  const stopwords = new Set(["the","a","an","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","could","should","may","might","shall","can","to","of","in","on","at","by","for","with","about","as","i","me","my","we","our","you","your","it","its","they","their","and","or","but","not","so","if","when","than","that","this","these","those","then","just","from","up","out","what","who","which","how","all","each","one","two","three"]);
  return new Set(
    text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w))
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return intersection.size / union.size;
}

function formGroups(users: Array<{ id: number; text: string; country?: string | null }>, minSize: number, maxSize: number): number[][] {
  const tokens = users.map(u => ({ id: u.id, tok: tokenize(u.text), country: u.country ?? null }));
  const assigned = new Set<number>();
  const groups: number[][] = [];

  for (const seed of tokens) {
    if (assigned.has(seed.id)) continue;
    const group = [seed.id];
    const groupCountries = new Set<string>(seed.country ? [seed.country] : []);
    assigned.add(seed.id);

    const scored = tokens
      .filter(t => !assigned.has(t.id))
      .map(t => {
        const similarity = jaccard(seed.tok, t.tok);
        // Diversity bonus: reward candidates from a country not yet in the group
        const diversityBonus = (t.country && !groupCountries.has(t.country)) ? 0.15 : 0;
        return { id: t.id, country: t.country, score: similarity + diversityBonus };
      })
      .sort((a, b) => b.score - a.score);

    for (const candidate of scored) {
      if (group.length >= maxSize) break;
      group.push(candidate.id);
      assigned.add(candidate.id);
      if (candidate.country) groupCountries.add(candidate.country);
    }

    if (group.length >= minSize) groups.push(group);
    else { for (const id of group) assigned.delete(id); }
  }

  return groups;
}

// POST /shine/scavenger/run-matching
// Matches all queued users by shared interests, creates groups, seeds group chats.
router.post("/shine/scavenger/run-matching", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  // Get everyone in the queue
  const queue = await db.select().from(shineMatchQueueTable).orderBy(shineMatchQueueTable.joinedAt);
  if (queue.length === 0) {
    res.json({ message: "Queue is empty", groupsCreated: 0 }); return;
  }

  // Auto-clean: remove anyone already in a group from the queue (handles stale entries)
  const existingGroups = await db.select().from(shineMatchGroupsTable);
  const alreadyGrouped = new Set(existingGroups.flatMap(g => g.memberIds.split(",").map(Number)));
  const staleIds = queue.map(q => q.userId).filter(id => alreadyGrouped.has(id));
  if (staleIds.length > 0) {
    await db.delete(shineMatchQueueTable).where(inArray(shineMatchQueueTable.userId, staleIds));
  }

  const eligibleIds = queue.map(q => q.userId).filter(id => !alreadyGrouped.has(id));

  const MIN_GROUP = 3;
  const MAX_GROUP = 8;

  if (eligibleIds.length < MIN_GROUP) {
    res.json({
      message: `Need at least ${MIN_GROUP} unmatched users in queue. Currently ${eligibleIds.length}.`,
      groupsCreated: 0,
      queueSize: queue.length,
    });
    return;
  }

  // Fetch user profiles + posts for text-based matching
  const eligibleUsers = await db.select().from(shineUsersTable).where(inArray(shineUsersTable.id, eligibleIds));

  const userPosts = await db
    .select()
    .from(shineSunlightPostsTable)
    .where(inArray(shineSunlightPostsTable.userId, eligibleIds))
    .orderBy(desc(shineSunlightPostsTable.createdAt));

  const postsByUser: Record<number, string[]> = {};
  for (const post of userPosts) {
    if (!postsByUser[post.userId]) postsByUser[post.userId] = [];
    if (postsByUser[post.userId].length < 8) {
      postsByUser[post.userId].push(`${post.title}: ${post.body}`);
    }
  }

  const userData = eligibleUsers.map(u => ({
    id: u.id,
    name: u.name,
    country: u.country ?? null,
    // country intentionally excluded from text — matched for diversity, not similarity
    text: [
      u.year ? `Year: ${u.year}` : "",
      u.concentration ? `Concentration: ${u.concentration}` : "",
      u.dorm ? `Dorm: ${u.dorm}` : "",
      u.isOnCampus ? "Currently on campus" : "",
      u.interests?.length ? `Interests: ${u.interests.join(", ")}` : "",
      u.hiddenJournal ? `Journal: ${u.hiddenJournal}` : "",
      ...(postsByUser[u.id] ?? []),
    ].filter(Boolean).join("\n").trim(),
  }));

  const groups = formGroups(userData, MIN_GROUP, MAX_GROUP);

  if (groups.length === 0) {
    res.json({ message: "Not enough users to form complete groups yet", groupsCreated: 0, queueSize: queue.length });
    return;
  }

  const createdGroups: Array<{ id: number; memberCount: number; summary: string }> = [];

  for (const memberIds of groups) {
    const members = userData.filter(u => memberIds.includes(u.id));
    let summary = "You were matched based on shared interests and goals.";

    try {
      const membersText = members
        .map((m, i) => `Student ${i + 1}: ${m.text.slice(0, 300) || "No profile info yet"}`)
        .join("\n\n");

      const prompt = `You are a Harvard International Students program coordinator. These students were intentionally matched across different countries to celebrate international diversity, while also sharing common interests, academic paths, or goals.

${membersText}

Write 1-2 friendly sentences (max 60 words) explaining why this group was matched. Highlight the mix of international backgrounds alongside their shared interests or goals. Start with "You were matched because..." and do NOT mention names or identifying info.`;

      summary = (await callOpenAI(prompt)).trim() || summary;
    } catch (_) { /* use default */ }

    // Create the group
    const [created] = await db
      .insert(shineMatchGroupsTable)
      .values({ memberIds: memberIds.join(","), matchingSummary: summary, status: "active" })
      .returning();

    // Seed the group chat with a welcome system message
    const memberNames = members.map(m => m.name.split(" ")[0]).join(", ");
    await db.insert(shineMatchGroupMessagesTable).values({
      groupId: created.id,
      userId: null,
      senderName: "SHINE",
      content: `🎉 You've been matched! Meet your group: ${memberNames}. ${summary} Browse the missions below and pick one to explore together — you'll earn bonus points as a matched group!`,
      messageType: "system",
    });

    // Remove matched users from the queue
    await db.delete(shineMatchQueueTable).where(inArray(shineMatchQueueTable.userId, memberIds));

    createdGroups.push({ id: created.id, memberCount: memberIds.length, summary });
  }

  res.json({
    message: `Matched ${createdGroups.length} group(s)! Group chats have been created.`,
    groupsCreated: createdGroups.length,
    groups: createdGroups,
  });
});

export default router;

