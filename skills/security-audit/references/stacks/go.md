# Go audit module

## Establish components

Read every `go.mod`/`go.work`, server and CLI entry point, router registration, middleware chain, generated RPC bindings, build tags, `embed` usage, and deployment file. Build tags and platform-specific files can materially change reachable code.

## High-value review paths

- Trace HTTP/RPC input, headers, path parameters, multipart files, messages, database content, config, and CLI arguments into queries, templates, commands, paths, network requests, decoders, reflection, and unsafe/CGO boundaries.
- Prefer `html/template` for HTML contexts; `text/template` does not HTML-escape. Check typed safe-content conversions and custom template functions.
- `database/sql` placeholders are driver-specific. Inspect string-built queries, identifiers, sort clauses, `fmt.Sprintf`, and ORM raw APIs.
- `exec.Command` does not invoke a shell by default, but user-controlled executable names, flags, environment, working directories, and commands passed to `sh -c` remain dangerous.
- Review integer conversion before allocation or slicing, unchecked lengths, decompression, regular expressions, goroutine creation, channel/backpressure, and unbounded reads for DoS.
- Check `filepath.Clean`/`Join`, `os.DirFS`, symlink handling, archive extraction, and canonical containment. Normalization alone does not establish confinement.
- Audit `net/http` timeouts and body limits in the actual server setup. Check trusted-proxy handling and forwarded header use.

## Framework and protocol checks

- For Gin, Echo, Fiber, Chi, and custom routers, enumerate the final route tree and middleware inheritance. Verify group nesting does not omit auth on alternate routes.
- For gRPC, inspect unary and stream interceptors, reflection exposure, per-message authorization, stream lifetime, and message-size limits.
- For WebSockets, validate origin policy when browser credentials are used, authorize each action, and bound message size/rate.
- For outbound requests, validate redirects and post-resolution IPs when enforcing SSRF policy. Check proxy environment behavior.

## Avoid false positives

- Map iteration order is intentionally unstable but is not a vulnerability without a violated security invariant.
- A goroutine or panic is not automatically exploitable DoS; establish remote reachability, recovery behavior, and attacker/resource asymmetry.
- Operator-controlled flags and environment are not remote input unless a separate boundary lets the attacker change them.
- Type safety does not remove logic, authorization, parser, unsafe, CGO, or resource-exhaustion risks.

## Dependency validation

Run `govulncheck ./...` when available. Its call-graph reachability is useful evidence, but confirm build tags, platform, configuration, and actual invocation before reporting.

## Upstream references

- [Go vulnerability management tooling](https://github.com/golang/vuln)
- [Official govulncheck GitHub Action](https://github.com/golang/govulncheck-action)
- [Go source and security policy](https://github.com/golang/go)
- [gosec analyzer](https://github.com/securego/gosec)
