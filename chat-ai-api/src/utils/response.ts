import type { Response } from "express";

export function sendResponse(res: Response, statusCode: number, data: any) {
  return res.status(statusCode).json(data);
}
