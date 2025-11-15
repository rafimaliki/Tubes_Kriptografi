import { Request, Response } from "express";

export const templateHandler = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Template handler" });
};
