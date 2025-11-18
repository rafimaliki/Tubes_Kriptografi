export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };
export type ChallengeApiResult = ApiResult<{ nonce_id: number; nonce: string }>;
export type LoginApiResult = ApiResult<{ message: string; jwt_token: string }>;
export type RegisterApiResult = ApiResult<{ message: string }>;
