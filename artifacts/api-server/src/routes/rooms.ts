import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, roomsTable, postsTable, usersTable } from "@workspace/db";
import {
  GetRoomParams,
  GetRoomTrendingParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/rooms", async (_req, res): Promise<void> => {
  const rooms = await db.select().from(roomsTable).orderBy(roomsTable.id);
  res.json(rooms);
});

router.get("/rooms/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetRoomParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, params.data.id));
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  res.json(room);
});

router.get("/rooms/:id/trending", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetRoomTrendingParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const posts = await db
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
    .where(eq(postsTable.roomId, params.data.id))
    .orderBy(desc(postsTable.likeCount))
    .limit(5);

  const formatted = posts.map(p => ({
    ...p,
    authorName: p.isAnonymous ? "Anonymous" : (p.pseudonym ?? p.displayName ?? "Student"),
  }));
  res.json(formatted);
});

export default router;
