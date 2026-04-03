import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, submissionsTable, usersTable } from "@workspace/db";

const router: IRouter = Router();

function getSessionId(req: import("express").Request): string | null {
  const raw = req.headers["x-session-id"];
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] : raw;
}

router.get("/submissions", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    res.status(401).json({ error: "x-session-id header required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.sessionId, sessionId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const submissions = await db.select().from(submissionsTable).where(eq(submissionsTable.userId, user.id));
  res.json(submissions);
});

export default router;
