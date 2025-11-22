import { LocalStorage } from "./LocalStorage";

export const JWT = {
  get(): string {
    const app_user = LocalStorage.load("app_user");
    const jwt_token = app_user && ((app_user as any).jwt_token as string);
    return jwt_token || "";
  },
};
