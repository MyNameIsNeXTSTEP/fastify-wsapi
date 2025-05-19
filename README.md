# fastify-wsapi-plugin

A Fastify plugin `fastify-wsapi-plugin` - is for building modular, schema-validated WebSocket APIs with route encapsulation, request/response validation, and handler registry.\
This plugin streamlines the process of defining, validating, and processing WebSocket messages in Fastify applications.

> <u>Consider that this project is under active development!</u>

## Objectives
Inspired by [metacom](https://www.npmjs.com/package/metacom) i decided to create something based on its goals in `fastify` as a **plugin**.\

So shortly speaking, this plugin let you use a self defined **WebSockets based API** in a kinda like `JSON-rpc` manner with the power of [JSON-schema protocol](http://json-schema.org/).\

You can define your own schemas or use default, that are defined in this project.

## Features
- **Route-based WebSocket APIs**: Register WebSocket endpoints with route-like semantics.

- **Schema Validation**: Validate incoming and outgoing messages using JSON schemas.

- **Handler Registry**: Centralized registry for WebSocket handlers and message processing.

- **Encapsulation**: Leverage Fastify's plugin encapsulation for modular, maintainable code.

- **TypeScript Support**: Built with TypeScript typings for safer development.

## Installation
```bash
# Using npm
npm install fastify-wsapi-plugin
# Using yarn
yarn add fastify-wsapi-plugin
```

## Usage

1. **Register the Plugin**
```js
import Fastify from 'fastify';
import wsapiPlugin from 'fastify-wsapi-plugin';

const fastify = Fastify();
await fastify.register(wsapiPlugin);
```

and enable the typings for typescript support in your `global.d.ts` file:
```ts
import 'fastify-wsapi-plugin/global';
```
> Yes, i know this is not so robust as i would like it to be, but for now this requires a manual setup.
> Plan to make the typings work automatically later.

2. **Define WebSocket Routes**
Create a module to register your WebSocket routes using fastify.wsRegistry.register. Each route is associated with a handler and optional request/response schemas.

```js
// wsV1Routes.js
import authApi from './auth'; // define some api object containing methods

export async function wsV1Routes(fastify) {
  fastify.wsRegistry.register('auth/login', authApi.login(fastify), {
    request: loginRequestSchema,
    response: loginResponseSchema,
  });

  fastify.wsRegistry.register('auth/signup', authApi.signup(fastify), {
    request: signupRequestSchema,
    response: signupResponseSchema,
  });

  fastify.wsRegistry.register('admin/unit/list', adminApi.unit(fastify), {
    request: unitListRequestSchema,
    response: unitListResponseSchema,
  });

  await fastify.register(wsEntryRoute);
}
```
- **Route Name**: First argument (e.g., `auth/login`).

- **Handler**: Second argument, a function to process the message.

- **Schemas**: Third argument, optional { request, response } schemas for validation.

3. **Validate Incoming Messages**
Use fastify.validateWSMessage to validate incoming messages against a base schema before processing.

```js
const baseValidation = fastify.validateWSMessage(data, baseMessageSchema);
if (!baseValidation.valid) {
  socket.send(JSON.stringify({
    id: data.id,
    error: {
      code: 400,
      message: 'Invalid message format',
      details: baseValidation.errors,
    },
  }));
  return;
}
```
- Returns `{ valid: boolean, errors: [...] }` for easy integration.

4. **Process Registered Handlers**
After validation, process the message using the registered handler via fastify.wsRegistry.process.

```js
const response = await fastify.wsRegistry.process(data, socket, request);
socket.send(JSON.stringify(response));
```

- Automatically dispatches to the correct handler based on the route.
- Handles response validation if a response schema is provided.

## Example

```js
import Fastify from 'fastify';
import wsapiPlugin from 'fastify-wsapi-plugin';
import { wsV1Routes } from './wsV1Routes.js';

const fastify = Fastify();

await fastify.register(wsapiPlugin);
await fastify.register(wsV1Routes);

await fastify.listen({ port: 3000 });
```

## API Reference

| Method	    | Description |
| -------- | ------- |
| `fastify.wsRegistry.register(route, handler, { request, response })`  | Register a WebSocket route with optional schemas.|
| `fastify.validateWSMessage(data, schema)` | Validate a message against a JSON schema. Returns { valid, errors } |
| `fastify.wsRegistry.process(data, socket, request)` | Process a message through the registered handler and return response |

## Best Practices
- **Encapsulate routes**: Use Fastify's plugin system to group related WebSocket routes for better maintainability.

- **Leverage validation**: Always validate incoming messages to ensure data integrity.

- **Schema-driven development**: Define request and response schemas for each route to enable strong typing and validation.

## License
MIT

### Contributing
Feel free to open issues or pull requests on GitHub.\
See all you need at my blogpost - http://gadzhievislam.org/Programming/Contributing/

### Acknowledgements
Built with inspiration from the Fastify plugin ecosystem and best practices for modular, scalable APIs.