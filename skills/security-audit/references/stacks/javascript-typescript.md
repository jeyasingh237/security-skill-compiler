# JavaScript and TypeScript audit module

## Establish runtime and frameworks

Read every relevant `package.json`, lockfile, workspace declaration, server entry point, route registry, and deployment file. Separate browser bundles, server code, build tooling, workers, Electron processes, and edge runtimes because their trust boundaries differ.

## High-value review paths

- Trace `req.params`, query, body, headers, cookies, WebSocket messages, uploaded files, webhook payloads, and persisted user content into queries, templates, commands, paths, redirects, outbound requests, logs, and dynamic module loading.
- Treat `child_process.exec`, shell-enabled wrappers, `eval`, `Function`, `vm`, unsafe template compilation, and user-controlled dynamic imports as high-signal sinks. `spawn`/`execFile` with an argument array avoids shell parsing but still requires executable and option validation.
- Check object merges and path setters for prototype pollution, especially when untrusted keys can become `__proto__`, `prototype`, or `constructor`.
- Verify JWT algorithm, issuer, audience, time, key selection, and token-type handling. Do not infer authorization from successful signature validation.
- For SSRF, follow redirects and verify DNS/IP policy at connection time. Check alternate IP encodings, credentials in URLs, proxy environment variables, and parser differences.
- Review regular expressions, JSON/body size limits, archive parsing, image/document processing, and recursive transforms for attacker-asymmetric denial of service.

## Framework-specific checks

### Express, Fastify, Koa, NestJS, Hono

- Enumerate final registered routes and middleware order. Confirm authentication and resource authorization on alternate, nested, batch, and error paths.
- Check proxy trust configuration before trusting forwarded IP, host, or protocol values.
- Validate body/parser limits per content type. Confirm error handlers do not leak secrets or skip transaction cleanup.
- Treat validation DTOs as type/shape controls, not authorization. Check mass assignment into persistence models.

### Next.js and Nuxt

- Treat route handlers, API routes, server actions, loaders, and server components as independently reachable server entry points.
- Require authorization inside the state-changing handler; middleware or hidden UI alone is not a sufficient resource-level boundary.
- Check cache keys, revalidation, static generation, preview/draft mode, image optimization, redirects, and host-derived absolute URLs for cross-user leakage or SSRF.
- Confirm secrets cannot cross server/client bundle boundaries and that server-only modules are not imported into client code.

### React, Vue, Angular, Svelte

- Normal interpolation is generally escaped. Focus on `dangerouslySetInnerHTML`, `v-html`, direct DOM HTML sinks, unsafe URL attributes, sanitizer bypass, postMessage origin checks, and third-party widgets.
- Follow stored content through server rendering, hydration, markdown, syntax highlighting, and client rendering; the safety context can change between layers.

### Electron

- Audit renderer-to-main IPC authorization, `contextIsolation`, sandboxing, preload bridges, navigation/window-open handlers, protocol handlers, and filesystem/shell capabilities exposed to untrusted content.

## Avoid false positives

- Parameterized query APIs and ORM predicates are normally injection-resistant; inspect raw fragments, dynamic identifiers, operators, sort fields, and escape hatches.
- React/Vue template interpolation is not XSS without an unsafe rendering context.
- Environment variables and deployment config are operator-controlled unless an attacker can modify the deployment or a request is copied into them.
- `path.join` and `path.normalize` do not enforce containment. Prove whether a later canonical containment check exists.

## Dependency validation

Run the package manager's audit command when available, but confirm the resolved version, vulnerable function, runtime reachability, and required configuration before reporting. Inspect lifecycle scripts and packages fetched from git or local paths.

## Upstream references

- [Node.js security policy and threat model](https://github.com/nodejs/node/blob/main/SECURITY.md)
- [Express production security guidance](https://github.com/expressjs/expressjs.com/blob/master/en/advanced/best-practice-security.md)
- [Next.js repository and documentation](https://github.com/vercel/next.js)
- [Electron security tutorial](https://github.com/electron/electron/blob/main/docs/tutorial/security.md)
- [npm audit CLI implementation](https://github.com/npm/cli)
