import { Router } from "express";
import { requireAdmin } from "../auth/auth.middleware";
import { analyticsController } from "./analytics.controller";

export const analyticsRouter = Router();

analyticsRouter.get("/summary", requireAdmin, analyticsController.summary);
analyticsRouter.get("/visits-today", requireAdmin, analyticsController.getVisitsToday);

// Route publique : appelée automatiquement par le frontend à chaque visite.
analyticsRouter.post("/track-visit", analyticsController.trackVisit);