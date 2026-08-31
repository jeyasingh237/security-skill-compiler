# Audit methodology

## 1. Model the target

Build a compact architecture map before interpreting suspicious code.

- List deployable units and their entry points.
- Identify actors, credentials, roles, tenants, and trust relationships.
- Inventory ingress: HTTP, RPC, sockets, files, archives, messages, environment, CLI, plugins, templates, and model/tool input.
- Inventory sensitive operations: authorization decisions, queries, commands, filesystem access, network egress, deserialization, dynamic evaluation, cryptography, secret access, and state transitions.
- Connect each input to its validators and sinks. Record gaps and inconsistent parallel paths.

Use production-owned configuration in the repository when deciding whether a path is enabled. Do not assume an absent application control is absent from the deployment; record it as an unverified assumption when infrastructure is out of scope.

## 2. Separate boundaries from conventions

A security boundary separates capabilities or trust levels. Examples include tenant A vs tenant B, anonymous vs authenticated, normal user vs administrator, browser origin vs server, sandbox vs host, model text vs tool invocation, and workload identity vs cloud control plane.

A convention is not automatically a boundary. Naming a method `internal`, placing code in an admin directory, or hiding a UI control does not enforce authorization.

For each state-changing operation, find the code that proves the caller may perform that operation on that exact resource. Check alternate endpoints, batch paths, background jobs, imports, retries, and recovery flows.

## 3. Hunt from source to sink

Start from both ends:

- From ingress, follow attacker-controlled values through parsing, normalization, validation, storage, and later reuse.
- From dangerous sinks, trace arguments backward until their controlling actor is established.

Look for cross-layer disagreements: URL parsing, encoding, Unicode normalization, integer width, case folding, canonical paths, content types, host headers, cache keys, token claims, schema coercion, and serialization round trips.

## 4. Exercise the sad path

Review failure, fallback, retry, cancellation, timeout, migration, partial-commit, cleanup, and first-run states. Test empty, missing, duplicate, negative, maximum, expired, revoked, replayed, reordered, and concurrent inputs where they affect security invariants.

## 5. Prove exploitability

A confirmed finding needs all of the following:

1. A defined attacker with realistic prerequisites.
2. A reachable entry point under those prerequisites.
3. A concrete payload or action sequence.
4. Evidence that defenses do not stop the path.
5. A security impact to confidentiality, integrity, or availability.

Prefer a local, minimal, non-destructive proof. If required infrastructure is unavailable, label the candidate as requiring deployment validation rather than confirmed.

## 6. Validate independently

Re-read the relevant flow with the goal of disproving it. Validate framework behavior against the version used by the target. Check tests, middleware ordering, generated routes, policy composition, feature gates, and deployment configuration. Preserve rejected candidates in structured output only when that history will prevent repeated false positives.
