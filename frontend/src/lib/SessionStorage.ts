import { Base64 } from "./Base64";

export const SessionStorage = {
  load: (session_storage_key: string): Object | null => {
    const data = sessionStorage.getItem(session_storage_key);
    if (data) {
      try {
        const decodedData = Base64.decode(data);
        return JSON.parse(decodedData);
      } catch {
        console.error("Failed to parse or decode sessionStorage data");
      }
    }
    return null;
  },
  
  save: (session_storage_key: string, object: Object | null): void => {
    if (object) {
      const encodedData = Base64.encode(JSON.stringify(object));
      sessionStorage.setItem(session_storage_key, encodedData);
    } else {
      sessionStorage.removeItem(session_storage_key);
    }
  },
  
  delete: (session_storage_key: string): void => {
    sessionStorage.removeItem(session_storage_key);
  },
};