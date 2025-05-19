/**
 * @todo Remove "no-explicit-any" and implement proper types for the api
 */
declare global {
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
