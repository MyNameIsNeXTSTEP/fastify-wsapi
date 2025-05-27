import type { WebSocket } from 'ws';
import { type ErrorObject } from 'ajv';

export interface WSRegistryEntry {
  handler: TWSHandler;
  schema: wsApi.WSMessageSchema;
}
declare module 'fastify' {
  export interface FastifyInstance<
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    HttpServer = Server,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    HttpRequest = IncomingMessage,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    HttpResponse = ServerResponse
  > {
    /**
     * Here we declare decorated values for the `fastify.decorate()`
     */
    validateWSMessage: (
      message: wsApi.WSMessage | wsApi.WSParams,
      schema: object
    ) => { valid: boolean; data?: wsApi.WSMessage; errors?: null | ErrorObject[] };
    validateWSResponse: (
      response: wsApi.WSResponse,
      schema: object
    ) => { valid: boolean; data?: wsApi.WSResponse; errors?: null | ErrorObject[] };
    wsRegistry: {
      register: (method: string, handler: WSHandler, schema: WSMessageSchema) => void;
      get: (method: string) => WSRegistryEntry | undefined;
      has: (method: string) => boolean;
      process: (message: WSMessage, socket: WebSocket, request: FastifyRequest) => Promise<WSResponse>;
    };
  }
};

export const wsRegistry: (fastify: FastifyInstance) => Promise<void>;
export const wsSchemaValidator: (fastify: FastifyInstance) => Promise<void>;

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
