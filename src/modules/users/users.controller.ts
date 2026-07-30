import type { NextFunction, Request, Response } from "express";
import { usersService } from "./users.service";

export const usersController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const offset = req.query.offset ? Number(req.query.offset) : 0;
      const result = await usersService.listUsers(limit, offset);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
};