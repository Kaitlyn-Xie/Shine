import { Router, type IRouter } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, resourcesTable } from "@workspace/db";
import {
  GetResourceParams,
  ListResourcesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/resources", async (req, res): Promise<void> => {
  const queryParams = ListResourcesQueryParams.safeParse(req.query);
  const { category, search } = queryParams.success ? queryParams.data : {};

  let resources = await db.select().from(resourcesTable).orderBy(resourcesTable.createdAt);

  if (category) {
    resources = resources.filter(r => r.category === category);
  }
  if (search) {
    const lower = search.toLowerCase();
    resources = resources.filter(r =>
      r.title.toLowerCase().includes(lower) ||
      r.summary.toLowerCase().includes(lower) ||
      r.content.toLowerCase().includes(lower)
    );
  }
  res.json(resources);
});

router.get("/resources/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetResourceParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [resource] = await db.select().from(resourcesTable).where(eq(resourcesTable.id, params.data.id));
  if (!resource) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }
  res.json(resource);
});

export default router;
