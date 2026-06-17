import { Router } from "express";
import { notificationsService } from "../services/notifications.service";

export const notificationsRouter = Router();

notificationsRouter.get("/", (_req, res) => {
  res.json(notificationsService.list());
});

notificationsRouter.get("/unread-count", (_req, res) => {
  res.json(notificationsService.unreadCount());
});

notificationsRouter.patch("/:id/read", (req, res) => {
  const n = notificationsService.markRead(req.params.id);
  if (!n) return res.status(404).json({ error: "Notification not found" });
  res.json(n);
});
