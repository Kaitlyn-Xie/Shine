import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import roomsRouter from "./rooms";
import postsRouter from "./posts";
import resourcesRouter from "./resources";
import circlesRouter from "./circles";
import missionsRouter from "./missions";
import teamsRouter from "./teams";
import statsRouter from "./stats";
import badgesRouter from "./badges";
import submissionsRouter from "./submissions";
import shineRouter from "./shine";

const router: IRouter = Router();

router.use(healthRouter);
router.use(shineRouter);
router.use(usersRouter);
router.use(roomsRouter);
router.use(postsRouter);
router.use(resourcesRouter);
router.use(circlesRouter);
router.use(missionsRouter);
router.use(teamsRouter);
router.use(statsRouter);
router.use(badgesRouter);
router.use(submissionsRouter);

export default router;
