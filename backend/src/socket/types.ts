import { Server as IOServer, Socket as IOSocket } from "socket.io";

export interface ClientToServerEvents {
  new_message: (
    payload: {
      from_user_id: number;
      to_user_id: number;
      message: string;
      message_for_sender: string;
      room_id: number;
    },
    callback: (response: any) => void
  ) => void;
  create_chat_room: (
    payload: {
      user1_id: number;
      user2_id: number;
    },
    callback: (response: any) => void
  ) => void;
}

export interface ServerToClientEvents {
  new_message: (payload: Object) => void;
  connected: (payload: { socketId: string }) => void;
}

export type IOType = IOServer<ClientToServerEvents, ServerToClientEvents>;
export type SocketType = IOSocket<ClientToServerEvents, ServerToClientEvents>;
