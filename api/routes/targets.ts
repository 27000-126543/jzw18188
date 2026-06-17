import { Router } from "express";
import { targetsService } from "../services/targets.service";

export const targetsRouter = Router();

targetsRouter.get("/", (req, res) => {
  const month = req.query.month as string | undefined;
  res.json(targetsService.list({ month }));
});

targetsRouter.post("/", (req, res) => {
  res.json(targetsService.create(req.body));
});

targetsRouter.put("/:id", (req, res) => {
  const t = targetsService.update(req.params.id, req.body);
  if (!t) return res.status(404).json({ error: "Target not found" });
  res.json(t);
});
