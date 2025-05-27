import type { FastifyInstance } from 'fastify';
/**
 * WS api registry as a Map of an endpoint name to its handler function
 */
declare const wsRegistryPLugin: (fastify: FastifyInstance) => Promise<void>;
export default wsRegistryPLugin;
