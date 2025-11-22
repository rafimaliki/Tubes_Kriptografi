import { Request, Response } from "express";
import { ChatAPISchema } from "@/schemas/chat.schema";
import { ChatRepository } from "@/repository/chat.repo";

export const ChatHandler = {
  async getMessages(req: Request, res: Response) {
    try {
      const parsed = ChatAPISchema.getMessages.req.parse(req.query);
      const { user1_id, user2_id } = parsed;
      const requester_id = (req as any).user.id;

      if (requester_id !== user1_id && requester_id !== user2_id) {
        return res
          .status(403)
          .json({ error: "Forbidden - You can only access your own chats" });
      }

      const messages = await ChatRepository.getMessagesBetweenUsers(
        user1_id,
        user2_id
      );
      res.status(200).json(messages);
    } catch (error) {
      res.status(400).json({ error });
    }
  },

  async getRecents(req: Request, res: Response) {
    try {
      const requester_id = (req as any).user.id;

      const recents = await ChatRepository.getRecentChatsForUser(requester_id);
      res.status(200).json(recents);
    } catch (error) {
      res.status(400).json({ error });
    }
  },
};
