import { Router, type IRouter } from "express";
import { db, badgesTable, submissionsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/badges", async (_req, res): Promise<void> => {
  const badges = await db.select().from(badgesTable).orderBy(badgesTable.id);
  res.json(badges);
});

export default router;
