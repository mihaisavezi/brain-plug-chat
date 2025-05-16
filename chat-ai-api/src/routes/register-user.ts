import type { NextFunction, Request, Response } from "express";

import { Router } from "express";
import { z } from "zod";

import { validate } from "../middleware/validation";
import { findUserByUserId } from "../services/db";
import { queryStreamUsers, upsertStreamUser } from "../services/stream";
import { sendResponse } from "../utils/response";

const router = Router();

const registerUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
});

router.post(
  "/",
  validate(registerUserSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { name, email } = req.body;

    try {
      const userId = email.replace(/[^\w-]/g, "_");
      console.log("🚀 ~ router.post ~ userId:", userId);

      // check if user exists in stream
      const userQueryResponse = await queryStreamUsers({ id: { $eq: userId } });
      console.log("🚀 ~ router.post ~ userQueryResponse:", userQueryResponse);

      if (!userQueryResponse.users.length) {
        // add new user to stream
        await upsertStreamUser({
          id: userId,
          name,
          email,
          role: "user",
        } as any); // TODO: Fix type
      }

      // check for existing user in database
      const existingUser = await findUserByUserId(userId);

      if (!existingUser.length) {
        console.log(`User ${userId} does not exist in the database. Adding them...`);
        // await db.insert(users).values({ userId, name, email }); // TODO: re-enable
      }

      return sendResponse(res, 200, { userId, name, email });
    }
    catch (error: any) {
      next(error);
    }
  },
);

export default router;
