# AI, LLM, agent, and MCP audit module

## Model the trust boundaries

Map every source of text/data entering prompts or model context: users, retrieved documents, web pages, email, issues, logs, code, tool results, memory, and other agents. Map privileged instructions, system/developer policy, tool capabilities, credentials, approval gates, and every destination of model output.

Treat model output as untrusted, probabilistic data even when it follows a schema. A prompt instruction is not an authorization control.

## High-value review paths

- Trace untrusted content into system/developer prompt construction. Determine whether it can override task boundaries, reveal secrets, select tools, change recipients, or alter durable state.
- Review retrieval ingestion and ranking for cross-tenant leakage, document-level authorization, poisoning, stale permissions, hidden content, and source attribution.
- Audit tool and MCP definitions, server authentication, transport origin, capability discovery, argument validation, resource scoping, confused deputy behavior, and user confirmation before consequential actions.
- Ensure authorization is enforced by the tool/service against the authenticated actor and target resource. Do not trust model-supplied user IDs, roles, tenant IDs, or approval statements.
- Validate model-produced URLs, paths, SQL/query fragments, shell arguments, code, templates, HTML/Markdown, email recipients, and API parameters at the execution boundary.
- Check indirect prompt injection through tool output and data connectors. Preserve separation between data and instructions even when the source is normally trusted.
- Review context assembly for API keys, credentials, private documents, unrelated tenants, internal policy, and logs. Minimize what the model receives; output filtering is not a substitute.
- Audit memory/session isolation, deletion, retention, replay, summaries, embeddings, cache keys, and handoff between users or agents.
- Check cost/token/tool-call limits, recursive agents, retry loops, streaming parsers, file sizes, and attacker-asymmetric resource use.

## Agent-specific attack paths

- Prompt injection -> tool call -> privileged action.
- Retrieved poisoned document -> hidden instruction -> credential/resource disclosure.
- Model output -> unsafe renderer -> stored or DOM XSS.
- Model-selected URL -> backend fetch -> SSRF.
- Model-selected path/command/query -> interpreter -> injection or data loss.
- Cross-user memory/retrieval cache -> confidential context disclosure.
- MCP server/tool name confusion -> capability substitution or rug pull.

## Validation

- Use inert canary secrets and non-destructive test resources. Never place real credentials in attack prompts or logs.
- A model occasionally refusing or following an injection does not prove a control. Test the deterministic enforcement layer around the model.
- Separate content integrity risk from actual privilege. If no tool, secret, or sensitive output is reachable, an instruction-following failure may be a quality issue rather than a vulnerability.
- Confirm the exact model/tool configuration and deployment; mock tools may not represent production authority.

## Avoid false positives

- Prompt injection is not automatically exploitable. Show the privileged decision or sensitive data it can affect.
- Schema validation constrains shape, not truth, authorization, safe semantics, or recipient/resource scope.
- Human-in-the-loop is a control only when the human sees the material consequences and cannot be socially engineered by attacker-controlled rendering.

## Upstream references

- [OWASP Top 10 for LLM Applications](https://github.com/OWASP/www-project-top-10-for-large-language-model-applications)
- [Model Context Protocol specification](https://github.com/modelcontextprotocol/modelcontextprotocol)
- [MITRE ATLAS](https://github.com/mitre-atlas/atlas-navigator-data)
- [Cloudflare security-audit AI companion](https://github.com/cloudflare/security-audit-skill/blob/main/skills/security-audit/AI-AND-LLM.md)
