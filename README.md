# security-skill-compiler

Compile a repository-specific security audit skill, then install it into the coding-agent harnesses that work on that repository.

The compiler detects languages, frameworks, infrastructure, and AI/LLM dependencies from repository evidence. It keeps a common exploitability-first audit workflow and includes only the stack modules that apply, reducing prompt noise and framework false positives.

## Quick start

Install for the harnesses already present in the current repository (plus the universal Agent Skills path):

```bash
npx security-skill-compiler@latest
```

Install into every project-scoped harness path supported by the compiler:

```bash
npx security-skill-compiler@latest --all-harnesses
```

Target selected harnesses or a different repository:

```bash
npx security-skill-compiler@latest install ./services/api \
  --harness codex,claude-code
```

Until the first npm release, run the package directly from GitHub:

```bash
npx github:jeyasingh237/security-skill-compiler --all-harnesses
```

The install is project-local. It does not change global agent configuration.

## Agent Skills CLI installation

This repository also ships a portable runtime-detecting skill at `skills/security-audit`. Install that uncompiled skill into any harness supported by the open Agent Skills CLI:

```bash
npx skills add jeyasingh237/security-skill-compiler \
  --skill security-audit \
  --all
```

The dedicated compiler is preferable for stable repositories because it records detection evidence in `STACK_PROFILE.md` and removes irrelevant stack modules. The generic skill runs the same detector when the audit starts.

## What gets detected

| Module | Manifests and signals | Framework examples |
|---|---|---|
| JavaScript / TypeScript | `package.json`, Deno config, JS/TS source | Next.js, Express, NestJS, Fastify, React, Vue, Electron |
| Python | `pyproject.toml`, requirements, Pipfile, Python source | Django, Flask, FastAPI, SQLAlchemy, Celery |
| Go | `go.mod`, Go source | Gin, Echo, Fiber, Chi, gRPC |
| Rust | `Cargo.toml`, Rust source | Axum, Actix Web, Rocket, Tonic, SQLx, Diesel |
| Java / Kotlin | Maven, Gradle, Java/Kotlin source | Spring Security, Quarkus, Micronaut, Ktor, Hibernate |
| .NET | project files, C#/F#/VB source | ASP.NET Core, EF Core, Microsoft Identity |
| PHP | `composer.json`, PHP source | Laravel, Symfony, Slim, Doctrine |
| Ruby | `Gemfile`, Ruby source | Rails, Sinatra, Grape, Sidekiq |
| Native | CMake/Make, C/C++ source | parsers, native services, libraries, FFI |
| Infrastructure / CI | Terraform/HCL, Docker, Kubernetes, Helm, workflows | Terraform, Pulumi, Kubernetes, Docker, GitHub Actions |
| AWS overlay | AWS providers/resources, CloudFormation, CDK, SAM, SDK dependencies | IAM, networking, edge, storage, databases, serverless, containers, logging |
| AI / LLM overlay | dependency manifests | OpenAI/Anthropic SDKs, LangChain, LlamaIndex, MCP |

Detection is evidence, not a vulnerability verdict. Generated profiles preserve the manifest/file signals and confidence for audit-time verification.

## Harness compatibility

The compiler emits the standard `SKILL.md` format.

- The universal `.agents/skills/` installation covers Codex, Cursor, Gemini CLI, GitHub Copilot, Cline, OpenCode, Amp, and other compatible harnesses.
- Claude Code receives `.claude/skills/` when detected or explicitly selected.
- `--all-harnesses` covers the complete project-path registry, including Windsurf, Roo Code, Continue, Goose, Kiro, Qwen Code, and other harnesses with dedicated paths.
- `security-skill-compiler harnesses` prints the current name-to-path registry.

Repeated runs safely update compiler-managed skills. An existing `security-audit` directory without `compiler-manifest.json` is left untouched unless `--force` is passed.

## Commands

### Detect

```bash
npx security-skill-compiler detect .
npx security-skill-compiler detect . --json
```

### Compile without installing

```bash
npx security-skill-compiler compile . \
  --output .security-skill-compiler/skills
```

The output is an Agent Skills pack containing `security-audit/SKILL.md`, stack references, scripts, a findings schema, and `STACK_PROFILE.md`.

### Install

```bash
# Auto: universal path plus harness directories already present
npx security-skill-compiler install .

# A practical cross-harness set
npx security-skill-compiler install . --harness major

# Explicit harnesses
npx security-skill-compiler install . --harness codex,cursor,claude-code

# Preview destinations and detection without writing
npx security-skill-compiler install . --all-harnesses --dry-run
```

Use `--max-files N` to change the default 25,000-file scan limit. Generated/vendor/build directories are ignored.

## Audit behavior

The generated skill guides the agent through:

1. repository and trust-boundary reconnaissance;
2. stack-specific attack planning;
3. source-to-sink tracing and safe local reproduction;
4. adversarial validation of every candidate;
5. severity based on real prerequisites and impact;
6. human-readable reporting and optional validated `findings.json`.

For broad AWS and IaC reviews, it also runs a mandatory posture track covering identity, logging/detection, network and edge, storage/data, compute, resilience, and governance controls. A per-control ledger prevents silent skips: each control must be marked pass, fail, not applicable, or unverified. Findings carry an evidence class so a repository-only review cannot silently claim that live account settings such as IAM key age, MFA, GuardDuty, or CloudTrail were checked.

It treats target repository content as untrusted instructions, separates hardening notes from vulnerabilities, requires dependency reachability, and avoids claiming dynamic confirmation from static analysis.

Web targets receive an additional cross-stack review module covering authentication and session lifecycle, horizontal/vertical authorization, tenancy, browser storage, XSS/CSRF/CORS/clickjacking, headers and CSP, HTTP/proxy/cache behavior, uploads, SSRF, OAuth/OIDC/SAML, TLS termination and cipher claims, dependency reachability, and business-logic/concurrency abuse. It explicitly treats OWASP as coverage guidance rather than a bug list, accounts for CDN/identity-proxy controls, verifies parser/runtime assumptions, avoids report padding, and records material controls that resisted testing.

The common workflow follows established security-audit practices, combining structured reconnaissance, stack-specific threat analysis, evidence-based validation, and independent verification. Stack modules cite official language/framework repositories and established ecosystem security tooling, including Node.js, Django, Go vulnerability management, RustSec, Spring Security, ASP.NET Core, Laravel/Symfony, Rails, Kubernetes, and OWASP.

## Development

Requires Node.js 18.17 or newer and has no runtime dependencies.

```bash
npm test
npm run check
npm pack --dry-run
```

The package is ready for npm publication under the unscoped name `security-skill-compiler`; publishing requires the repository owner's npm credentials and is intentionally not performed by this project code.

## License

MIT
