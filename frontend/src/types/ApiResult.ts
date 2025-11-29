// generic type
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

// auth api
export type ChallengeApiResult = ApiResult<{ nonce_id: number; nonce: string }>;
export type LoginApiResult = ApiResult<{ message: string; jwt_token: string }>;
export type RegisterApiResult = ApiResult<{ message: string }>;

export interface MessageEntry {
  id: number;
  from_user_id: number;
  to_user_id: number;
  room_id: number;
  message: string;
  message_for_sender: string;
  created_at: string; // timestamp
  signature: string;
  isVerified: boolean;
}

// chat api
export type MessagesApiResult = ApiResult<MessageEntry[]>;
export type RecentsApiResult = ApiResult<
  [
    {
      room_id: number;
      participants: {
        id: number;
        username: string;
        public_key: string;
      }[];
      last_message: MessageEntry;
    },
  ]
>;

// user api
export type UserApiResult = ApiResult<{
  id: number;
  username: string;
  public_key: string;
}>;
