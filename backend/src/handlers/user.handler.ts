import { Request, Response } from "express";
import { UserRepository } from "@/repository/app_user.repo";
import { UserAPISchema } from "@/schemas/user.schema";

export const UserHandler = {
  async getUser(req: Request, res: Response) {
    const parsed = UserAPISchema.get.req.parse(req.params);
    const { username } = parsed;

    try {
      const user = await UserRepository.getByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
