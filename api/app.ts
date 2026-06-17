import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import { usersRouter } from "./routes/users.js";
import { leadsRouter } from "./routes/leads.js";
import { customersRouter } from "./routes/customers.js";
import { analyticsRouter } from "./routes/analytics.js";
import { targetsRouter } from "./routes/targets.js";
import { notificationsRouter } from "./routes/notifications.js";
import { seedDatabase } from "./db/seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

seedDatabase();

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/users", usersRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/customers", customersRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/targets", targetsRouter);
app.use("/api/notifications", notificationsRouter);

app.use(
  "/api/health",
  (_req: Request, res: Response, _next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: "ok",
    });
  }
);

app.use(
  (error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Server internal error",
    });
  }
);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "API not found",
  });
});

export default app;
