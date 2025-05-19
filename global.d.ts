/**
 * @todo Remove "no-explicit-any" and implement proper types for the api
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

interface ICookies {
  get: (cookieName: string) => string;
}

interface IAuthAPI {
  login: (credentials: { username: string; password: string }) => Promise<any>;
  signup: (userData: { username: string; password: string; email: string;[key: string]: any }) => Promise<any>;
  logout: () => Promise<any>;
}

interface IAdminAPI {
  getUsers: () => Promise<any[]>;
  updateUser: (userData: { id: string | number;[key: string]: any }) => Promise<any>;
  deleteUser: (userId: string | number) => Promise<any>;
}

interface IWebSocketAPI {
  auth: IAuthAPI;
  admin: IAdminAPI;
  connect: () => WebSocketAPI;
  getSocket: () => WebSocket | null;
  disconnect: () => void;
}

declare global {
  interface Window {
    api: IWebSocketAPI;
    Cookies: ICookies;
  }
  const api: IWebSocketAPI;
  const Cookies: ICookies;

  namespace wsApi {
    type WSParams = Record<string, object> | undefined;

    interface WSMessage {
      id: number;
      type: string;
      method: string;
      params?: WSParams;
      token: string;
    }

    interface WSResponse {
      id: number;
      result: Record<string, object> | string | string[] | number;
      cookies: Record<string, object>,
      error?: {
        code: number;
        message: string;
      };
    }
    interface WSMessageSchema {
      request: object;
      response: object;
    }
  }
}

export { };
