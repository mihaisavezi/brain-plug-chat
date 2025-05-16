import type { NextFunction, Request, Response } from "express";

import { eq } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";

import { db } from "../config/db";
import { chats } from "../db/schema";
import { validate } from "../middleware/validation";
import { sendResponse } from "../utils/response";

const router = Router();

const getMessagesSchema = z.object({
  userId: z.string(),
});

router.post(
  "/",
  validate(getMessagesSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { userId } = req.body;

    try {
      const chatHistory = await db
        .select()
        .from(chats)
        .where(eq(chats.userId, userId));
      return sendResponse(res, 200, { messages: chatHistory });
    }
    catch (error: any) {
      next(error);
    }
  },
);

export default router;
