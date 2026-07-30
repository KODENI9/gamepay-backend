import type { NextFunction, Request, Response } from "express";
import { analyticsService } from "./analytics.service";

export const analyticsController = {
  async summary(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? Number(req.query.days) : 30;
      const data = await analyticsService.getSummary(days);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },

  async trackVisit(req: Request, res: Response) {
    try {
      await analyticsService.trackVisit();
    } catch {
      // On ignore silencieusement : un souci de tracking ne doit jamais
      // bloquer l'affichage du site pour un visiteur.
    }
    res.status(204).send();
  },

  async getVisitsToday(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await analyticsService.getVisitsToday();
      res.json({ data: { count } });
    } catch (err) {
      next(err);
    }
  },
};

