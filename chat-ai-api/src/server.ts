import type { Request, Response } from "express";
import type { ChatCompletionMessageParam } from "openai/resources";
import type { UserResponse } from "stream-chat";

import cors from "cors";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import express from "express";
import OpenAI from "openai";
import { StreamChat } from "stream-chat";

import { db } from "./config/db";
import { chats, users } from "./db/schema";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// initialize stream chat
const chatClient = StreamChat.getInstance(process.env.STREAM_API_KEY!, process.env.STREAM_API_SECRET!);
// initialize openai client
const openaiClient = new OpenAI({
  apiKey: process.env.AI_MODEL_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// Register user with stream chat
app.post("/register-user", async (req: Request, res: Response): Promise<any> => {
  const { name, email } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const userId = email.replace(/[^\w-]/g, "_");
    console.log("🚀 ~ app.post ~ userId:", userId);

    // check if user exists
    const userResponse = await chatClient.queryUsers({ id: { $eq: userId } });
    console.log("🚀 ~ app.post ~ userResponse:", userResponse);

    if (!userResponse.users.length) {
      // add new user to stream
      await chatClient.upsertUser({ id: userId, name, email, role: "user" } as UserResponse & { email: string });
    }

    // check for existing user in database
    const existingUser = await db.select().from(users).where(eq(users.userId, userId));

    if (!existingUser.length) {
      console.log(`User ${userId} does not exist in the database. Adding them...`);
      await db.insert(users).values({ userId, name, email });
    }

    return res.status(200).json({ userId, name, email });
  }
  catch (error) {
    console.log("🚀 ~ app.post ~ error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// send message to AI
app.post("/chat", async (req: Request, res: Response): Promise<any> => {
  const { message, userId } = req.body || {};
  console.log(`🚀 ~ app.post ~  { message, userId }:`, { message, userId });

  if (!message || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // verify user exists
    const userResponse = await chatClient.queryUsers({ id: { $eq: userId } });

    if (!userResponse.users.length) {
      // add new user to stream
      return res.status(404).json({ error: "Please register first" });
    }

    // check for existing user in database
    const existingUser = await db.select().from(users).where(eq(users.userId, userId));
    if (!existingUser.length) {
      return res.status(404).json({ error: "User not found in database. Please register first" });
    }
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

    // send message to gpt 4
    const response = await openaiClient.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: conversation as ChatCompletionMessageParam[],
    });

    const aiMessage: string = response.choices[0].message?.content ?? "No response from AI";

    // save chat to database
    await db.insert(chats).values({ userId, message, reply: aiMessage });

    // create or get channel
    const channel = chatClient.channel("messaging", `chat-${userId}`, {
      created_by_id: "ai_bot",
    });
    await channel.create();
    await channel.sendMessage({ text: aiMessage, user_id: "ai_bot" });

    return res.status(200).json({ reply: aiMessage });

    // return res.send("success");
  }
  catch (error) {
    console.log("🚀 ~ Error generating AI response", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/get-messages", async (req: Request, res: Response): Promise<any> => {
  const { userId } = req.body || {};

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const chatHistory = await db.select().from(chats).where(eq(chats.userId, userId));
    return res.status(200).json({
      messages: chatHistory,
    });
  }
  catch (error) {
    console.log("🚀 ~ Error fetching chat history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
