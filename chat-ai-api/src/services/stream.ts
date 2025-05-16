import type { UserResponse } from "stream-chat";

import { chatClient } from "../clients/streamClient";

export async function upsertStreamUser(user: UserResponse & { email: string }) {
  await chatClient.upsertUser(user);
}

export async function queryStreamUsers(query: any) {
  const userQueryResponse = await chatClient.queryUsers(query);
  return userQueryResponse;
}
