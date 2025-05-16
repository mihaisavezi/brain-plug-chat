import cors from "cors";
import "dotenv/config";
import express from "express";

import { errorHandler } from "./middleware/error";
// Import routers
import chatRouter from "./routes/chat";
import getMessagesRouter from "./routes/get-messages";
import registerUserRouter from "./routes/register-user";

// DB is configured in ./config/db and imported by routes as needed.
// Clients (OpenAI, Stream) are initialized in ./clients and imported by routes as needed.

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Mount routers
app.use("/register-user", registerUserRouter);
app.use("/chat", chatRouter);

app.use("/get-messages", getMessagesRouter);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
