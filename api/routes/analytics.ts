import { Router } from "express";
import { analyticsService } from "../services/analytics.service";

export const analyticsRouter = Router();

analyticsRouter.get("/funnel", (_req, res) => {
  res.json(analyticsService.funnel());
});

analyticsRouter.get("/stage-duration", (_req, res) => {
  res.json(analyticsService.stageDuration());
});

analyticsRouter.get("/close-cycle", (_req, res) => {
  res.json(analyticsService.closeCycle());
});
