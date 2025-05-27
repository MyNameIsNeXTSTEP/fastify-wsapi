import fp from 'fastify-plugin';
/**
 * WS api registry as a Map of an endpoint name to its handler function
 */
const wsRegistryPLugin = fp(async function (fastify) {
    const registry = new Map();
    fastify.decorate('wsRegistry', {
        register: (method, handler, schema) => {
            registry.set(method, { handler, schema });
        },
        get: (method) => registry.get(method),
        has: (method) => registry.has(method),
        /**
         * Checks if the method is available, validate the request/response, send response back.
         */
        process: async (message, socket, request) => {
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
                let responseValidation = {};
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
            }
            catch (err) {
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
