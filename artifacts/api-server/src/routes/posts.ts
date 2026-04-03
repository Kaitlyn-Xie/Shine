import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, postsTable, repliesTable, roomsTable, usersTable, postLikesTable } from "@workspace/db";
import {
  ListRoomPostsParams,
  ListRoomPostsQueryParams,
  CreatePostParams,
  CreatePostBody,
  GetPostParams,
  DeletePostParams,
  ReactToPostParams,
  ListPostRepliesParams,
  CreateReplyParams,
  CreateReplyBody,
  VerifyReplyParams,
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

function parseId(raw: string | string[]): number {
  const str = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(str, 10);
}

router.get("/rooms/:roomId/posts", async (req, res): Promise<void> => {
  const params = ListRoomPostsParams.safeParse({ roomId: parseId(req.params.roomId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const query = ListRoomPostsQueryParams.safeParse(req.query);

  let dbQuery = db
    .select({
      id: postsTable.id,
      roomId: postsTable.roomId,
      userId: postsTable.userId,
      content: postsTable.content,
      isAnonymous: postsTable.isAnonymous,
      tags: postsTable.tags,
      likeCount: postsTable.likeCount,
      replyCount: postsTable.replyCount,
      isPinned: postsTable.isPinned,
      createdAt: postsTable.createdAt,
      displayName: usersTable.displayName,
      pseudonym: usersTable.pseudonym,
    })
    .from(postsTable)
    .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
    .where(eq(postsTable.roomId, params.data.roomId))
    .orderBy(desc(postsTable.isPinned), desc(postsTable.createdAt))
    .limit(50);

  const posts = await dbQuery;
  const formatted = posts.map(p => ({
    ...p,
    authorName: p.isAnonymous ? "Anonymous" : (p.pseudonym ?? p.displayName ?? "Student"),
  }));
  res.json(formatted);
});

router.post("/rooms/:roomId/posts", async (req, res): Promise<void> => {
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
  const params = CreatePostParams.safeParse({ roomId: parseId(req.params.roomId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [post] = await db
    .insert(postsTable)
    .values({
      roomId: params.data.roomId,
      userId: user.id,
      content: parsed.data.content,
      isAnonymous: parsed.data.isAnonymous ?? false,
      tags: parsed.data.tags ?? [],
    })
    .returning();

  await db.update(roomsTable).set({ postCount: db.$with("r").as(r => r.select({ n: postsTable.roomId }).from(postsTable).where(eq(postsTable.roomId, params.data.roomId))) } as never);
  // Update post count
  try {
    const countRows = await db.select().from(postsTable).where(eq(postsTable.roomId, params.data.roomId));
    await db.update(roomsTable).set({ postCount: countRows.length }).where(eq(roomsTable.id, params.data.roomId));
  } catch (_) {}

  res.status(201).json({
    ...post,
    authorName: post.isAnonymous ? "Anonymous" : (user.pseudonym ?? user.displayName),
  });
});

router.get("/posts/:id", async (req, res): Promise<void> => {
  const params = GetPostParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [post] = await db
    .select({
      id: postsTable.id,
      roomId: postsTable.roomId,
      userId: postsTable.userId,
      content: postsTable.content,
      isAnonymous: postsTable.isAnonymous,
      tags: postsTable.tags,
      likeCount: postsTable.likeCount,
      replyCount: postsTable.replyCount,
      isPinned: postsTable.isPinned,
      createdAt: postsTable.createdAt,
      displayName: usersTable.displayName,
      pseudonym: usersTable.pseudonym,
    })
    .from(postsTable)
    .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
    .where(eq(postsTable.id, params.data.id));

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json({
    ...post,
    authorName: post.isAnonymous ? "Anonymous" : (post.pseudonym ?? post.displayName ?? "Student"),
  });
});

router.delete("/posts/:id", async (req, res): Promise<void> => {
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
  const params = DeletePostParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, params.data.id));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  if (post.userId !== user.id && user.role === "student") {
    res.status(403).json({ error: "Not authorized" });
    return;
  }
  await db.delete(postsTable).where(eq(postsTable.id, params.data.id));
  res.sendStatus(204);
});

router.post("/posts/:id/react", async (req, res): Promise<void> => {
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
  const params = ReactToPostParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, params.data.id));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  const existing = await db
    .select()
    .from(postLikesTable)
    .where(and(eq(postLikesTable.postId, params.data.id), eq(postLikesTable.userId, user.id)));

  if (existing.length > 0) {
    await db.delete(postLikesTable).where(and(eq(postLikesTable.postId, params.data.id), eq(postLikesTable.userId, user.id)));
    const [updated] = await db.update(postsTable).set({ likeCount: Math.max(0, post.likeCount - 1) }).where(eq(postsTable.id, params.data.id)).returning();
    res.json({ ...updated, authorName: post.isAnonymous ? "Anonymous" : "Student" });
    return;
  }
  await db.insert(postLikesTable).values({ postId: params.data.id, userId: user.id });
  const [updated] = await db.update(postsTable).set({ likeCount: post.likeCount + 1 }).where(eq(postsTable.id, params.data.id)).returning();
  res.json({ ...updated, authorName: post.isAnonymous ? "Anonymous" : "Student" });
});

router.get("/posts/:postId/replies", async (req, res): Promise<void> => {
  const params = ListPostRepliesParams.safeParse({ postId: parseId(req.params.postId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const replies = await db
    .select({
      id: repliesTable.id,
      postId: repliesTable.postId,
      userId: repliesTable.userId,
      content: repliesTable.content,
      isVerified: repliesTable.isVerified,
      isAnonymous: repliesTable.isAnonymous,
      createdAt: repliesTable.createdAt,
      displayName: usersTable.displayName,
      pseudonym: usersTable.pseudonym,
    })
    .from(repliesTable)
    .leftJoin(usersTable, eq(repliesTable.userId, usersTable.id))
    .where(eq(repliesTable.postId, params.data.postId))
    .orderBy(repliesTable.createdAt);

  const formatted = replies.map(r => ({
    ...r,
    authorName: r.isAnonymous ? "Anonymous" : (r.pseudonym ?? r.displayName ?? "Student"),
  }));
  res.json(formatted);
});

router.post("/posts/:postId/replies", async (req, res): Promise<void> => {
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
  const params = CreateReplyParams.safeParse({ postId: parseId(req.params.postId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateReplyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [reply] = await db
    .insert(repliesTable)
    .values({
      postId: params.data.postId,
      userId: user.id,
      content: parsed.data.content,
      isAnonymous: parsed.data.isAnonymous ?? false,
    })
    .returning();

  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, params.data.postId));
  if (post) {
    await db.update(postsTable).set({ replyCount: post.replyCount + 1 }).where(eq(postsTable.id, params.data.postId));
  }

  res.status(201).json({
    ...reply,
    authorName: reply.isAnonymous ? "Anonymous" : (user.pseudonym ?? user.displayName),
  });
});

router.post("/replies/:id/verify", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    res.status(401).json({ error: "x-session-id header required" });
    return;
  }
  const user = await getUserBySession(sessionId);
  if (!user || user.role === "student") {
    res.status(403).json({ error: "Only mentors or admins can verify replies" });
    return;
  }
  const params = VerifyReplyParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [reply] = await db
    .update(repliesTable)
    .set({ isVerified: true })
    .where(eq(repliesTable.id, params.data.id))
    .returning();
  if (!reply) {
    res.status(404).json({ error: "Reply not found" });
    return;
  }
  res.json({ ...reply, authorName: reply.isAnonymous ? "Anonymous" : "Mentor" });
});

export default router;
