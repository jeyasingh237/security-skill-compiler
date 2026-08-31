# Attack classes

Select classes based on reachable surfaces. Split broad classes by subsystem in large repositories.

## Identity and authorization

- Authentication bypass, token or session confusion, account recovery abuse, credential lifecycle flaws.
- Missing object-, field-, function-, or tenant-level authorization.
- Confused deputy behavior across services, jobs, webhooks, plugins, or delegated tokens.
- Stale permissions after role changes, revocation, deletion, or cache expiry.

## Injection and unsafe interpretation

- SQL, NoSQL, LDAP, XPath, shell, template, expression-language, header, log, and email injection.
- XSS, DOM injection, unsafe URL schemes, client messaging/origin mistakes, and prototype pollution.
- Unsafe deserialization, dynamic loading, evaluation, reflection, macros, or plugin execution.
- Second-order injection after storage, export, indexing, logging, or rendering in a different context.

## Resource and network access

- Path traversal, symlink races, archive extraction, upload confusion, unsafe temporary files.
- SSRF through redirects, DNS changes, alternate IP formats, proxy behavior, or webhook callbacks.
- Request smuggling, cache poisoning, host-header abuse, CORS mistakes, and parser differentials.
- Resource exhaustion with meaningful attacker asymmetry.

## Business logic and state

- Skipped, reordered, replayed, or concurrently executed workflow steps.
- Check-then-act races, duplicate claims, double spend, stale reads, and partial rollback.
- Negative quantities, overflow, precision loss, type coercion, quota or limit bypass.
- Import/export, restore, preview, search, notification, and bulk-operation privilege gaps.

## Cryptography and secrets

- Hardcoded or exposed credentials, unsafe logging, over-broad tokens, and missing key rotation.
- Non-cryptographic randomness for security decisions, nonce reuse, weak password storage.
- Missing integrity or authenticity checks, fail-open verification, algorithm or key confusion.
- Timing or error oracles only when measurable and consequential.

## Supply chain and build

- Reachable vulnerable dependencies, malicious lifecycle hooks, dependency confusion, unpinned executable actions.
- Build artifact substitution, unsafe release permissions, credential exposure to untrusted pull requests.
- Generated code or vendored components that cross a production trust boundary.

## Native and protocol memory safety

- Out-of-bounds access, use-after-free, uninitialized data, unsafe FFI, integer truncation, and lifetime errors.
- Parser state inconsistencies, malformed length fields, algorithmic complexity, and panic/crash paths reachable from untrusted input.

## AI and agent systems

- Prompt injection crossing from untrusted content into privileged instructions.
- Tool or MCP capability escalation, argument injection, excessive agency, and missing confirmation boundaries.
- Retrieval poisoning, cross-user memory leakage, insecure output rendering, and secret disclosure through context.
- Treat model output as untrusted even when it is schema-shaped.

## Wildcard pass

Inspect unusual code and assumptions not covered above. Follow boring helpers, compatibility layers, migrations, debug endpoints, and feature-specific shortcuts. Attackers do not respect taxonomy.
