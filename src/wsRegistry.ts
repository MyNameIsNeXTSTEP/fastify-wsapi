import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { WebSocket } from 'ws';
import { type ErrorObject } from 'ajv/dist/types';

type TWSHandler = (
  message: wsApi.WSMessage,
  socket: WebSocket,
  request: FastifyRequest
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

interface WSRegistryEntry {
  handler: TWSHandler;
  schema: wsApi.WSMessageSchema;
}

/**
 * WS api registry as a Map of an endpoint name to its handler function
 */
const wsRegistryPLugin = fp(async function (fastify: FastifyInstance) {
  const registry = new Map<string, WSRegistryEntry>();

  fastify.decorate('wsRegistry', {
    register: (method: string, handler: TWSHandler, schema: wsApi.WSMessageSchema) => {
      registry.set(method, { handler, schema });
    },

    get: (method: string) => registry.get(method),

    has: (method: string) => registry.has(method),

    /**
     * Checks if the method is available, validate the request/response, send response back.
     */
    process: async (message: wsApi.WSMessage, socket: WebSocket, request: FastifyRequest) => {
      const { method } = message;
      const entry = registry.get(method);
      if (!entry) {
        return {
          id: message.id,
          error: {
            code: 404,
            message: `Method ${method} not found`,
          },
        };
      }
      const validation = fastify.validateWSMessage(message.params, entry.schema.request);
      if (!validation.valid) {
        return {
          id: message.id,
          error: {
            code: 400,
            message: 'Invalid request parameters',
            details: validation.errors,
          },
        };
      }
      try {
        const result = await entry.handler(message, socket, request);
        let responseValidation = {} as {
          valid: boolean;
          data?: wsApi.WSResponse;
          errors?: null | ErrorObject[];
        }
        /**
         * Early return if its the error response object
         */
        if ('error' in result) {
          return {
            id: message.id,
            code: result.code,
            error: result.error,
          };
        }
        responseValidation = fastify.validateWSResponse(result, entry.schema.response);
        if (!responseValidation.valid) {
          console.error('Response validation failed', responseValidation.errors);
          return {
            id: message.id,
            error: {
              code: 500,
              message: responseValidation.errors,
            },
          };
        }
        return {
          id: message.id,
          method,
          result: responseValidation.data,
        };
      } catch (err) {
        console.error(err);
        return {
          id: message.id,
          error: {
            code: 500,
            message: 'Internal server error',
          },
        };
      }
    },
  });
});

export default wsRegistryPLugin;

