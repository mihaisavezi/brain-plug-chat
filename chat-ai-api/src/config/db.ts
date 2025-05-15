import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

// loadenv;
config({
  path: ".env",
});

if (!process.env.DB_URL) {
  throw new Error("DB_URL is not defined");
}

// Init Neon client
const sql = neon(process.env.DB_URL);

// drizzle orm
export const db = drizzle(sql);
