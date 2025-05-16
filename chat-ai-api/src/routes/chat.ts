import type { NextFunction, Request, Response } from "express";
import type { ChatCompletionMessageParam } from "openai/resources";

import { eq } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";

import { openaiClient } from "../clients/openaiClient";
import { chatClient } from "../clients/streamClient";
import { db } from "../config/db";
import { chats } from "../db/schema";
import { validate } from "../middleware/validation";
import { sendResponse } from "../utils/response";

const router = Router();

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  userId: z.string(),
});

router.post(
  "/",
  validate(chatSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { message, userId } = req.body;

    try {
      // fetch users past messages for context
      const chatHistory = await db
        .select()
        .from(chats)
        .where(eq(chats.userId, userId))
        .orderBy(chats.createdAt)
        .limit(10);

      // format chat history for openAI
      const conversation: ChatCompletionMessageParam[] = chatHistory.flatMap(chat => [
        { role: "user", content: chat.message },
        { role: "assistant", content: chat.reply },
      ]);

      conversation.push({ role: "user", content: message });

      // send message to AI model
      const response = await openaiClient.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: conversation,
      });

      const aiMessage: string = response.choices[0].message?.content ?? "No response from AI";

      // save chat to database
      await db.insert(chats).values({ userId, message, reply: aiMessage });

      // create or get channel and send message via Stream
      const channel = chatClient.channel("messaging", `chat-${userId}`, { created_by_id: "ai_bot" });
      await channel.create();
      await channel.sendMessage({ text: aiMessage, user_id: "ai_bot" });

      return sendResponse(res, 200, { reply: aiMessage });
    }
    catch (error: any) {
      next(error);
    }
  },
);

export default router;
