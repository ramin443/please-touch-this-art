import { Router, type IRouter } from "express";
import healthRouter from "./health";
import artistChatRouter from "./artistChat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(artistChatRouter);

export default router;
