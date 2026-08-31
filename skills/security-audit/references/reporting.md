# Reporting and validation

## Reporting threshold

Report a vulnerability only when attacker control, reachability, missing/insufficient defenses, and meaningful impact are supported by evidence. Use a separate "Needs deployment validation" section for strong hypotheses that require unavailable infrastructure. Put non-exploitable improvements under "Hardening notes".

## Severity

Use exploit preconditions and realized impact together:

- **Critical**: unauthenticated or broadly reachable compromise of the application, control plane, signing authority, or highly sensitive data at scale.
- **High**: major confidentiality/integrity loss, cross-tenant compromise, meaningful authorization bypass, or code execution with realistic prerequisites.
- **Medium**: bounded but meaningful impact requiring authentication, user interaction, uncommon state, or limited target selection.
- **Low**: confirmed security impact with small blast radius or demanding prerequisites. Do not use Low for generic hardening.

Keep scanner severity only as supporting metadata.

## Human-readable finding

Use this structure:

```markdown
## SSC-001: Concise vulnerability title

- Severity: High
- Confidence: High
- Location: path/to/file.ext:line
- CWE: CWE-NNN (when the mapping is precise)
- Attacker prerequisites: ...
- Affected component: ...

### Attack path
1. Exact attacker input or action.
2. Entry point and transformation path.
3. Missing or bypassed security decision.
4. Sink and observable result.

### Impact
Concrete confidentiality, integrity, or availability loss.

### Evidence
Minimal relevant code and local reproduction results. Redact secrets.

### Remediation
Fix the violated boundary at the narrowest reliable enforcement point, then add a regression test.

### Validation
What was executed, what was inferred, and which assumptions remain.
```

## Audit summary

Include:

- scope and commit/diff when known;
- detected stacks and deployable components;
- confirmed findings by severity;
- areas reviewed with no confirmed vulnerability;
- tooling executed and its limitations;
- untested surfaces and deployment assumptions;
- rejected high-signal candidates when explaining false-positive control is useful.

Never state that a codebase is secure. State what was reviewed and what was or was not found under the stated conditions.
