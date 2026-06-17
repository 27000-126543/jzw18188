import { Router } from "express";
import { usersService } from "../services/users.service";

export const usersRouter = Router();

usersRouter.get("/", (_req, res) => {
  res.json(usersService.list());
});
