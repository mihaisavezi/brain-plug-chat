import { eq } from "drizzle-orm";

import { db } from "../config/db";
import { users } from "../db/schema";

export async function findUserByUserId(userId: string) {
  const existingUser = await db.select().from(users).where(eq(users.userId, userId));
  return existingUser;
}
