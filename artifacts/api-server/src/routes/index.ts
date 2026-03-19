import { Router, type IRouter } from "express";
import healthRouter from "./health";
import piRouter from "./pi";
import alertRouter from "./alert";

const router: IRouter = Router();

router.use(healthRouter);
router.use(piRouter);
router.use(alertRouter);

export default router;
