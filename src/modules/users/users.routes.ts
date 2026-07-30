import { Router } from "express";
import { requireAdmin } from "../auth/auth.middleware";
import { usersController } from "./users.controller";

export const usersRouter = Router();

usersRouter.get("/", requireAdmin, usersController.list);