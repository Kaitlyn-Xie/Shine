import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { scryptSync, randomBytes, randomUUID } from "crypto";
import {
  db,
  shineUsersTable,
  shineFeedPostsTable,
  shineSunlightPostsTable,
  shineHuntCompletionsTable,
  shineQuestionAnswersTable,
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
  const { passwordHash, sessionToken, ...safe } = user;
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

export default router;
