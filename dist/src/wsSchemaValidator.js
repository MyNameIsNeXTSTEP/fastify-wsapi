import fp from 'fastify-plugin';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
const wsSchemaValidationPLugin = fp(async function (fastify) {
    const ajv = new Ajv({
        removeAdditional: true,
        useDefaults: true,
        coerceTypes: true,
        allErrors: true,
    });
    addFormats(ajv);
    /**
     * Register schemas from Fastify instance
     */
    const schemas = fastify.getSchemas();
    for (const key in schemas) {
        ajv.addSchema(schemas[key]);
    }
    /**
     * Validate incoming message
     */
    // @ts-ignore
    fastify.decorate('validateWSMessage', (message, schema) => {
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
    fastify.decorate('validateWSResponse', (response, schema) => {
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
