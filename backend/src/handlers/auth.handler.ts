import { Request, Response } from "express";
import { AuthAPISchema } from "@/schemas/auth.schema";
import { NonceStoreRepository } from "@/repository/nonce_store.repo";
import { UserRepository } from "@/repository/app_user.repo";
import { generateJwt } from "@/lib/jwt";

export const AuthHandler = {
  async challenge(req: Request, res: Response) {
    try {
      const parsed = AuthAPISchema.challenge.req.parse(req.body);
      const { username } = parsed;

      const app_user = await UserRepository.getByUsername(username);
      if (!app_user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const nonce_obj = await NonceStoreRepository.generate(username);

      res.status(200).json({ nonce_id: nonce_obj.id, nonce: nonce_obj.nonce });
    } catch (error) {
      res.status(400).json({ error });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const parsed = AuthAPISchema.login.req.parse(req.body);
      const { username, nonce_id, signed_nonce } = parsed;

      const app_user = await UserRepository.getByUsername(username);
      if (!app_user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const stored_nonce = await NonceStoreRepository.get(username, nonce_id);
      if (!stored_nonce) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // perlu cek timestamp nonce juga

      const verified = true; // verifySignature(username, stored_nonce, signed_nonce);
      if (!verified) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const jwt_payload = {
        user_id: app_user.id,
        username: app_user.username,
        user_public_key: app_user.public_key,
      };

      const jwt_token = generateJwt(jwt_payload);

      await NonceStoreRepository.deleteForUsername(username);

      res
        .status(200)
        .json({ message: "Login successful", jwt_token: jwt_token });
    } catch (error) {
      res.status(400).json({ error });
    }
  },

  async register(req: Request, res: Response) {
    try {
      const parsed = AuthAPISchema.register.req.parse(req.body);

      const existing_user = await UserRepository.getByUsername(parsed.username);
      if (existing_user) {
        return res.status(400).json({ error: "Username already exists" });
      }

      await UserRepository.create(parsed.username, parsed.public_key);

      res.status(200).json({ message: "Registration successful" });
    } catch (error) {
      res.status(400).json({ error });
    }
  },
};
