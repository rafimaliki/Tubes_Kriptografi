import jwt from "jsonwebtoken";

// nanti ganti ke env variable
const secret = "hiahiahiahiahaiha";
const expiration = "24h";

export function generateJwt(payload: object) {
  return jwt.sign(payload, secret, {
    expiresIn: expiration,
    algorithm: "HS256",
  });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, secret) as object;
  } catch (error) {
    throw new Error("Invalid token: " + (error as Error).message);
  }
}
