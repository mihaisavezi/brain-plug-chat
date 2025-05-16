import { StreamChat } from "stream-chat";

// Assuming dotenv.config() is called in the main server entry point (e.g., server.ts)

if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
  // This check will run at module load time. If env vars are not set by the time this module is imported, it will throw.
  throw new Error("Stream API key or secret is not defined in environment variables. Ensure .env is loaded.");
}

export const chatClient = StreamChat.getInstance(process.env.STREAM_API_KEY!, process.env.STREAM_API_SECRET!);
