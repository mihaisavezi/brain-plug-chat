import OpenAI from "openai";

// Assuming dotenv.config() is called in the main server entry point (e.g., server.ts)

export const openaiClient = new OpenAI({
  apiKey: process.env.AI_MODEL_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});
