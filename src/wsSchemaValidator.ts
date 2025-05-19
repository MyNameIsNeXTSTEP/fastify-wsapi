import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import Ajv, { type AnySchema } from 'ajv';

const wsSchemaValidationPLugin = fp(async function (fastify: FastifyInstance) {
  const ajv = new Ajv({
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    allErrors: true,
  });

  /**
   * Register schemas from Fastify instance
   */
  const schemas = fastify.getSchemas();
  for (const key in schemas) {
    ajv.addSchema(schemas[key] as AnySchema | AnySchema[]);
  }

  /**
   * Validate incoming message
   */
  fastify.decorate('validateWSMessage', (message: wsApi.WSMessage | wsApi.WSParams, schema: object) => {
    const validate = ajv.compile(schema);
    const valid = validate(message);
    if (!valid) {
      return {
        valid: false,
        errors: validate.errors,
      };
    }
    return {
      valid: true,
      data: message,
    };
  });

  /**
   * Validate outcoming response
   */
  fastify.decorate('validateWSResponse', (response: wsApi.WSResponse, schema: object) => {
    const validate = ajv.compile(schema);
    const valid = validate(response);
    if (!valid) {
      return {
        valid: false,
        errors: validate.errors,
      };
    }
    return {
      valid: true,
      data: response,
    };
  });
});

export default wsSchemaValidationPLugin;
