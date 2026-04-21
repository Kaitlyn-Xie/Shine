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
  const completions = await db
    .select()
    .from(shineHuntCompletionsTable)
    .orderBy(desc(shineHuntCompletionsTable.createdAt));

  const userMap: Record<number, { name: string; pts: number; missions: number }> = {};
  for (const c of completions) {
    if (!userMap[c.userId]) {
      userMap[c.userId] = { name: "", pts: 0, missions: 0 };
    }
    userMap[c.userId].pts += c.ptsTotal;
    userMap[c.userId].missions += 1;
  }

  const userIds = Object.keys(userMap).map(Number);
  if (userIds.length === 0) {
    res.json([]);
    return;
  }

  const users = await db
    .select({ id: shineUsersTable.id, name: shineUsersTable.name })
    .from(shineUsersTable)
    .where(eq(shineUsersTable.id, userIds[0]));

  const allUsers = await db
    .select({ id: shineUsersTable.id, name: shineUsersTable.name })
    .from(shineUsersTable);

  for (const u of allUsers) {
    if (userMap[u.id]) userMap[u.id].name = u.name;
  }

  const leaderboard = Object.entries(userMap)
    .map(([id, data]) => ({
      userId: Number(id),
      name: data.name || "Anonymous",
      pts: data.pts,
      missions: data.missions,
    }))
    .sort((a, b) => b.pts - a.pts)
    .slice(0, 20);

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

// ── Match Missions ────────────────────────────────────────────────────────────

// List all active matching missions
router.get("/shine/scavenger/missions", async (req, res): Promise<void> => {
  const missions = await db
    .select()
    .from(shineMatchMissionsTable)
    .where(eq(shineMatchMissionsTable.isActive, true))
    .orderBy(shineMatchMissionsTable.id);

  res.json(missions);
});

// Join a mission (queues the user for matching)
router.post("/shine/scavenger/missions/:id/join", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const missionId = parseInt(req.params.id, 10);
  if (isNaN(missionId)) { res.status(400).json({ error: "Invalid mission id" }); return; }

  // Verify the mission exists and is active
  const [mission] = await db
    .select()
    .from(shineMatchMissionsTable)
    .where(and(eq(shineMatchMissionsTable.id, missionId), eq(shineMatchMissionsTable.isActive, true)));
  if (!mission) { res.status(404).json({ error: "Mission not found" }); return; }

  // Upsert participation (do nothing if already joined)
  await db
    .insert(shineMissionParticipantsTable)
    .values({ userId: user.id, missionId })
    .onConflictDoNothing();

  res.json({ ok: true });
});

// Leave a mission
router.delete("/shine/scavenger/missions/:id/join", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const missionId = parseInt(req.params.id, 10);
  if (isNaN(missionId)) { res.status(400).json({ error: "Invalid mission id" }); return; }

  await db
    .delete(shineMissionParticipantsTable)
    .where(
      and(
        eq(shineMissionParticipantsTable.userId, user.id),
        eq(shineMissionParticipantsTable.missionId, missionId)
      )
    );

  res.json({ ok: true });
});

// ── My Groups ────────────────────────────────────────────────────────────────

router.get("/shine/scavenger/my-groups", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  // Find all groups that include this user
  const allGroups = await db
    .select()
    .from(shineMatchGroupsTable)
    .orderBy(desc(shineMatchGroupsTable.createdAt));

  const myGroups = allGroups.filter(g => {
    const ids = g.memberIds.split(",").map(Number);
    return ids.includes(user.id);
  });

  if (myGroups.length === 0) { res.json([]); return; }

  // Load mission info and member profiles
  const missionIds = [...new Set(myGroups.map(g => g.missionId))];
  const allMissionRows = await db
    .select()
    .from(shineMatchMissionsTable)
    .where(inArray(shineMatchMissionsTable.id, missionIds));
  const missionMap: Record<number, typeof shineMatchMissionsTable.$inferSelect> = {};
  for (const m of allMissionRows) missionMap[m.id] = m;

  const allMemberIds = [...new Set(myGroups.flatMap(g => g.memberIds.split(",").map(Number)))];
  const allMembers = await db
    .select({ id: shineUsersTable.id, name: shineUsersTable.name, country: shineUsersTable.country, year: shineUsersTable.year })
    .from(shineUsersTable)
    .where(inArray(shineUsersTable.id, allMemberIds));
  const memberMap: Record<number, { id: number; name: string; country: string | null; year: string | null }> = {};
  for (const m of allMembers) memberMap[m.id] = m;

  // Get the missions joined by this user to show participation status
  const participated = await db
    .select()
    .from(shineMissionParticipantsTable)
    .where(eq(shineMissionParticipantsTable.userId, user.id));
  const joinedMissionIds = new Set(participated.map(p => p.missionId));

  const result = myGroups.map(g => ({
    id: g.id,
    missionId: g.missionId,
    mission: missionMap[g.missionId] ?? null,
    members: g.memberIds.split(",").map(Number).map(id => memberMap[id] ?? { id, name: "Unknown" }),
    matchingSummary: g.matchingSummary,
    createdAt: g.createdAt.toISOString(),
  }));

  res.json(result);
});

// ── Check participation status ─────────────────────────────────────────────────

router.get("/shine/scavenger/my-participation", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const participated = await db
    .select()
    .from(shineMissionParticipantsTable)
    .where(eq(shineMissionParticipantsTable.userId, user.id));

  res.json({
    isScavengerOptIn: user.isScavengerOptIn,
    joinedMissionIds: participated.map(p => p.missionId),
  });
});

// ── AI Matching ───────────────────────────────────────────────────────────────
// POST /shine/scavenger/missions/:id/run-matching
// Runs semantic grouping for all eligible participants who are not yet in a group.
// Uses GPT to generate groups and per-group summaries.
// Can be triggered by any authenticated user or an admin.

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

// Simple Jaccard similarity on word tokens for fallback when AI is unavailable
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

// Greedy group formation: sort by mutual similarity, form groups of minSize
function formGroups(
  users: Array<{ id: number; text: string }>,
  minSize: number,
  maxSize?: number | null
): number[][] {
  const tokens = users.map(u => ({ id: u.id, tok: tokenize(u.text) }));
  const assigned = new Set<number>();
  const groups: number[][] = [];
  const cap = maxSize ?? minSize * 2;

  for (const seed of tokens) {
    if (assigned.has(seed.id)) continue;
    const group = [seed.id];
    assigned.add(seed.id);

    // Pick the most similar unassigned users
    const scored = tokens
      .filter(t => !assigned.has(t.id))
      .map(t => ({ id: t.id, score: jaccard(seed.tok, t.tok) }))
      .sort((a, b) => b.score - a.score);

    for (const candidate of scored) {
      if (group.length >= cap) break;
      group.push(candidate.id);
      assigned.add(candidate.id);
    }

    if (group.length >= minSize) {
      groups.push(group);
    } else {
      // Not enough for a full group — add leftovers into last group if it fits
      if (groups.length > 0 && groups[groups.length - 1].length + group.length <= cap) {
        groups[groups.length - 1].push(...group);
      } else {
        // Hold them — keep them unassigned so they'll be grouped next time more join
        for (const id of group) assigned.delete(id);
      }
    }
  }

  return groups;
}

router.post("/shine/scavenger/missions/:id/run-matching", async (req, res): Promise<void> => {
  const sessionToken = getSessionId(req);
  if (!sessionToken) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await getShineUser(sessionToken);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const missionId = parseInt(req.params.id, 10);
  if (isNaN(missionId)) { res.status(400).json({ error: "Invalid mission id" }); return; }

  const [mission] = await db
    .select()
    .from(shineMatchMissionsTable)
    .where(eq(shineMatchMissionsTable.id, missionId));
  if (!mission) { res.status(404).json({ error: "Mission not found" }); return; }

  // Find all participants who opted in and aren't already grouped
  const participants = await db
    .select({ userId: shineMissionParticipantsTable.userId })
    .from(shineMissionParticipantsTable)
    .where(eq(shineMissionParticipantsTable.missionId, missionId));

  const participantIds = participants.map(p => p.userId);
  if (participantIds.length === 0) {
    res.json({ message: "No participants yet", groupsCreated: 0 }); return;
  }

  // Find who's already in a group for this mission
  const existingGroups = await db
    .select()
    .from(shineMatchGroupsTable)
    .where(eq(shineMatchGroupsTable.missionId, missionId));

  const alreadyGrouped = new Set(
    existingGroups.flatMap(g => g.memberIds.split(",").map(Number))
  );

  const eligibleIds = participantIds.filter(id => !alreadyGrouped.has(id));

  if (eligibleIds.length < mission.minGroupSize) {
    res.json({
      message: `Need at least ${mission.minGroupSize} ungrouped participants. Currently ${eligibleIds.length}.`,
      groupsCreated: 0,
    });
    return;
  }

  // Collect text for each eligible user: hidden journal + their recent posts
  const eligibleUsers = await db
    .select()
    .from(shineUsersTable)
    .where(inArray(shineUsersTable.id, eligibleIds));

  // Also grab their sunlight posts
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

  // Build per-user text blobs
  const userData = eligibleUsers.map(u => ({
    id: u.id,
    name: u.name,
    text: [
      u.hiddenJournal ?? "",
      ...(postsByUser[u.id] ?? []),
    ].join("\n").trim(),
  }));

  // Form groups using similarity
  const groups = formGroups(userData, mission.minGroupSize, mission.maxGroupSize);

  if (groups.length === 0) {
    res.json({ message: "Not enough eligible participants to form groups", groupsCreated: 0 });
    return;
  }

  // For each group, generate a matching summary via AI, then persist
  const createdGroups: Array<{ id: number; memberIds: number[]; summary: string }> = [];

  for (const memberIds of groups) {
    const members = userData.filter(u => memberIds.includes(u.id));
    let summary = "You were matched based on shared interests and goals.";

    try {
      const membersText = members
        .map((m, i) => `Student ${i + 1}: ${m.text.slice(0, 300) || "No information provided"}`)
        .join("\n\n");

      const prompt = `You are a Harvard International Students program coordinator. The following students were matched together for a scavenger hunt mission called "${mission.title}".

${membersText}

Write 1-2 friendly sentences (max 60 words) explaining why this group was matched together. Focus on shared interests, needs, or goals you notice in their writing. Start directly with "You were matched because..." and do NOT mention any names or identifying information.`;

      summary = (await callOpenAI(prompt)).trim() || summary;
    } catch (e) {
      // AI summary generation failed — use default
    }

    const [created] = await db
      .insert(shineMatchGroupsTable)
      .values({
        missionId,
        memberIds: memberIds.join(","),
        matchingSummary: summary,
      })
      .returning();

    createdGroups.push({ id: created.id, memberIds, summary });
  }

  res.json({
    message: `Successfully created ${createdGroups.length} group(s)`,
    groupsCreated: createdGroups.length,
    groups: createdGroups.map(g => ({
      id: g.id,
      memberCount: g.memberIds.length,
      summary: g.summary,
    })),
  });
});

export default router;

