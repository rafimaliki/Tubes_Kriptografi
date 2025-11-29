import { Server } from "socket.io";
import type { IOType, SocketType } from "./types";
import type { Server as HttpServer } from "http";
import { verifyJwt } from "@/lib/jwt";
import { ChatRoomRepository } from "@/repository/chat_room.repo";
import { ChatRepository } from "@/repository/chat.repo";

let io: IOType | null = null;

const userSocketMap = new Map<number, string>();
const socketUserMap = new Map<string, number>();

export function initSocket(server: HttpServer) {
  if (io) return io;

  const allowedOrigins = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
    : ["http://localhost:3000"];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    allowEIO3: true,
    transports: ["websocket", "polling"],
  }) as IOType;

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("NO_TOKEN"));
    }

    try {
      const decoded = verifyJwt(token);
      socket.data.user = decoded;
      next();
    } catch (err) {
      return next(new Error("INVALID_TOKEN"));
    }
  });

  io.on("connection", (socket: SocketType) => {
    console.log(`[socket] client connected: ${socket.id}`);

    const user = socket.data.user;
    const userId = user.id;

    userSocketMap.set(userId, socket.id);
    socketUserMap.set(socket.id, userId);

    // setup koneksi
    socket.emit("connected", { socketId: socket.id });
    socket.on("disconnect", (reason) => {
      console.log(`[socket] client disconnected: ${socket.id} (${reason})`);

      const uid = socketUserMap.get(socket.id);
      if (uid) userSocketMap.delete(uid);
      socketUserMap.delete(socket.id);
    });

    // event dari client
    socket.on("new_message", async (data, callback) => {
      // buat chat baru di database
      const new_chat = await ChatRepository.create(
        data.from_user_id,
        data.to_user_id,
        data.message,
        data.message_for_sender,
        data.signature,
        data.created_at,
        data.room_id,
      );

      console.log("[socket] new_chat created:", new_chat);

      // tambahkan atribut lain yang perlu dikirim ke client
      const enriched_chat = {
        ...new_chat,
        isVerified: true, // placeholder, nanti dicek di client
      }

      // perlu handler error disini
      callback({ chat: enriched_chat });
      
      // broadcast ke penerima
      const to_user_id = data.to_user_id;
      const to_socket_id = userSocketMap.get(to_user_id);

      if (to_socket_id) {
        io?.to(to_socket_id).emit("new_message", { chat: enriched_chat });
        console.log(
          `[socket] new_message emitted to userId=${to_user_id} at socketId=${to_socket_id}`
        );
      } else {
        console.log(
          `[socket] userId=${to_user_id} is not connected, cannot emit new_message`
        );
      }
    });

    socket.on("create_chat_room", async (payload, callback) => {
      console.log(`[socket] create_chat_room from userId=${userId}:`, payload);

      // proses
      const room_id = await ChatRoomRepository.getOrCreate(
        payload.user1_id,
        payload.user2_id
      );

      // perlu handler error disini
      callback({ room_id: room_id });
    });
  });

  console.log("[socket] initialized");
  return io;
}

export function getIO() {
  return io;
}
