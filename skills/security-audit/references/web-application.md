# Web application audit module

Use this module for browser applications, HTTP APIs, GraphQL, WebSockets, webhooks, and federated web identity. Combine it with the detected language/framework modules and the deployment configuration that owns the effective controls.

## Map the effective web architecture

- Inventory hosts, origins, route groups, API versions, alternate content types and verbs, browser bundles, admin surfaces, background consumers, webhooks, upload/download paths, GraphQL operations, and WebSocket handshakes/messages.
- Identify the browser-to-edge-to-origin chain. Establish where TLS terminates and where authentication, rate limiting, caching, CORS, CSP/security headers, request normalization, body limits, and bot/WAF rules are enforced.
- Enumerate actors and session types: anonymous, user, tenant administrator, platform administrator, service account, support/impersonation, OAuth client, webhook sender, and internal job. State the intended authority of each before calling behavior privilege escalation.
- Compare UI, mobile/API, legacy, bulk, import/export, webhook, and internal routes. A hidden UI control is not an authorization boundary.

## Identity, authentication, and session lifecycle

- Trace registration, login, logout, remember-me, password change/reset, email/phone change, MFA enrollment/recovery, invitation, account linking, impersonation, and identity-provider callbacks as state machines.
- Verify anti-enumeration and rate/abuse controls at the effective deployment layer. Do not report missing application-level throttling when an evidenced edge control protects the same route and identity key.
- Test session rotation at authentication and privilege changes; logout, password-change, recovery, role-change, and account-disable invalidation according to the documented threat model; refresh-token rotation/reuse; idle/absolute expiry; and race behavior across multiple sessions.
- Treat weak password policy and unrestricted concurrent login as policy observations unless they violate an explicit requirement or enable a demonstrated attack. Check whether an external identity provider owns the policy.
- For cookies and tokens, verify secrecy, integrity, scope, audience, issuer, token type, expiry, revocation, key selection, and replay boundaries. Cookie flags are meaningful in the context of the route, origin, CSRF model, and transport—not as isolated checklist findings.
- For OAuth/OIDC/SAML, verify redirect URI matching, `state`/nonce/PKCE, code and token substitution, issuer mix-up, account-linking identity, assertion conditions, signature/key selection, and authorization after federation.

## Authorization and tenancy

- Build a role-resource-action matrix from server-side behavior. Exercise every state-changing operation with unauthenticated, lower-role, same-role/different-owner, and different-tenant identities where those actors exist.
- Change object IDs, parent IDs, tenant context, fields, filters, sort keys, include/expand parameters, GraphQL aliases/fragments, batch members, and import/export contents. Check reads, writes, deletes, search, counts, metadata, errors, and side channels.
- Trace authorization through queues, scheduled jobs, callbacks, support tools, cached decisions, signed URLs, and service-to-service credentials. Verify that the original actor and tenant cannot be confused or dropped.
- An administrator performing intentionally authorized administrator actions is not vertical privilege escalation. Look for a lower-trust actor reaching that authority, a confused deputy, cross-tenant impact, or violation of an explicit separation-of-duty invariant.

## Browser, origin, and rendering boundaries

- Trace every attacker-controlled value to its final HTML, attribute, URL, CSS, JavaScript, JSON-in-HTML, SVG, markdown, template, and DOM context. Account for stored and second-order rendering, server-side rendering, hydration, sanitizers, and encoding changes.
- Test CSRF based on the actual credential mechanism and browser behavior. Check unsafe methods, login/linking flows, method overrides, simple content types, SameSite assumptions, and cross-origin forms.
- Test CORS as a data/action path, including credentials, reflected or parsed origins, `null`, subdomain takeover, preflight differences, and cache variation. A permissive header without sensitive cross-origin access is not automatically a vulnerability.
- For clickjacking, determine whether sensitive actions can be framed and completed under realistic browser conditions. Evaluate CSP `frame-ancestors` and `X-Frame-Options` at the effective response layer; a missing header alone is usually hardening.
- Inspect `postMessage` origin/source checks, opener relationships, redirects and unsafe URL schemes, DOM clobbering/prototype pollution paths, service workers, third-party scripts/widgets, and browser cache behavior.
- Browser storage is not a vulnerability by itself. Report `localStorage`/`sessionStorage` use only when the stored value is unnecessarily sensitive or replayable and an attacker path can read or abuse it. Compare against the threat model for XSS, malicious extensions, shared devices, and logout clearing.

## Inputs, protocols, and server-side sinks

- Test all supported parsers and content types for validation differences, parameter pollution, duplicate keys, type coercion, mass assignment, unsafe deserialization, and request boundary disagreement.
- Trace query, command, template, expression, header, log, mail, path, archive, and URL inputs to their real sinks. After confirming safe abstractions, inspect raw fragments, dynamic identifiers/operators, custom serializers, unsafe templates, and bypass paths.
- For SSRF, include redirects, DNS rebinding/time-of-check differences, proxy behavior, alternate address formats, URL userinfo/fragments, cloud metadata, and callbacks. Verify the policy at connection time.
- Review uploads and downloads for content/extension disagreement, active content, path traversal, archive extraction, parser vulnerabilities, storage authorization, signed URL scope, and cross-origin serving.
- Where multiple HTTP components disagree, test host/proxy trust, forwarded headers, cache keys, path normalization, content length/transfer encoding, method handling, and error routing. Verify parser/runtime claims against the deployed versions or a minimal reproduction.

## Business logic and creative abuse

- Write the intended state transitions and invariants for purchases, credits, quotas, approvals, invitations, subscriptions, recovery, ownership transfer, and other domain workflows. Try skipping, reordering, replaying, duplicating, cancelling, racing, and partially failing steps.
- Exercise negative, zero, maximum, rounded, stale, expired, duplicate, and concurrently submitted values. Check whether idempotency, uniqueness, locks, and transaction boundaries hold across retries and workers.
- Look for chains: low-impact disclosure plus reset abuse, upload plus same-origin rendering, SSRF plus cloud identity, invitation plus account linking, cache poisoning plus stored content, or tenant confusion plus a background job.
- Do not stop because a scanner or framework blocks common payloads. Follow application-specific invariants and alternate paths that automated tools cannot infer.

## Headers, transport, and dependency claims

- Evaluate CSP, HSTS, framing, MIME sniffing, referrer policy, cross-origin isolation/resource policies, Permissions Policy, cookie attributes, and cache controls against the application's actual content and attack surface. Missing headers are not a bundle finding by default; report the exploitable consequence or keep them as requested posture/hardening observations.
- `X-XSS-Protection` is deprecated and non-standard. Do not report it as missing, and do not assume enabling it improves security; verify modern output handling and CSP instead.
- Assess TLS at the component that terminates the client connection. For CBC/Lucky Thirteen or weak-cipher claims, establish the effective protocol/cipher support, affected implementation/version, realistic attacker conditions, and observable impact. Application source that sits behind a CDN or load balancer does not prove the public TLS posture.
- For dependency advisories such as Lodash CVEs, verify the resolved production version, vulnerable function/configuration, attacker-controlled input, bundle/runtime location, and reachable impact. A package name or version range alone is not a finding.

## Coverage from common web reports

The workflow above explicitly covers vertical privilege escalation, browser storage, clickjacking, vulnerable dependencies, session invalidation after password change, password policy, missing or obsolete security headers, concurrent sessions, TLS CBC/Lucky Thirteen conditions, and the broader authorization/session/browser/deployment paths around them. Each item must still pass the exploitability or posture reporting threshold.

## Upstream references

- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/)
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [MDN X-XSS-Protection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-XSS-Protection)
