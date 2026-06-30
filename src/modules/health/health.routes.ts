import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { healthCheckController, pingController } from "./health.controller.js";

const router = Router();

router.get("/", asyncHandler(healthCheckController));

router.head("/", asyncHandler(healthCheckController));

router.get("/ping", pingController);

export default router;
