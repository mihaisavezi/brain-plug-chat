import type { NextFunction, Request, Response } from "express";

import fs from "node:fs";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  console.error(err.stack);
  fs.appendFile("error.log", `${new Date().toISOString()} - ${err.stack}\n`, (error: any) => {
    if (error) {
      console.error("Error writing to log file:", error);
    }
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? null : err,
  });
}
