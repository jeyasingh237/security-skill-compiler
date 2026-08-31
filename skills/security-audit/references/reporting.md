# Reporting and validation

## Reporting threshold

Report a vulnerability only when attacker control, reachability, missing/insufficient defenses, and meaningful impact are supported by evidence. Use a separate "Needs deployment validation" section for strong hypotheses that require unavailable infrastructure. Put non-exploitable improvements under "Hardening notes".

For an explicitly requested cloud/IaC posture or benchmark review, report independently evidenced control failures under "Posture findings." A posture finding does not need a demonstrated attack path, but it does need an applicable security objective, an affected resource/scope, and evidence that the control actually fails. Do not mark a live-account control failed merely because it is absent from repository IaC.

## Severity

Use exploit preconditions and realized impact together:

- **Critical**: unauthenticated or broadly reachable compromise of the application, control plane, signing authority, or highly sensitive data at scale.
- **High**: major confidentiality/integrity loss, cross-tenant compromise, meaningful authorization bypass, or code execution with realistic prerequisites.
- **Medium**: bounded but meaningful impact requiring authentication, user interaction, uncommon state, or limited target selection.
- **Low**: confirmed security impact with small blast radius or demanding prerequisites. Do not use Low for generic hardening.

Keep scanner severity only as supporting metadata.

For posture findings, use the same impact-based scale but allow **Informational** for inventory/lifecycle observations with no direct security impact. Identify resilience, observability, cost/lifecycle, and compliance-only concerns so readers do not mistake them for exploitable vulnerabilities.

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

## Human-readable posture finding

Use a distinct ID namespace and structure:

```markdown
## SSC-P-001: Concise control failure

- Severity: Medium
- Confidence: High
- Control family: Detection and logging
- Evidence class: live-account
- Affected resources: arn:... (or repository path/resource address)
- Production traffic impact: Unknown (only when requested)

### Risk
The concrete security, resilience, observability, or governance consequence.

### Evidence
The effective value or read-only inventory result, including account/region/query coverage without sensitive data.

### Remediation
The required control and any rollout caveat.

### Validation
What was checked, collection time when live, and remaining gaps.
```

Group resources only when the failed control, cause, severity, and remediation are the same. Otherwise split them. Preserve machine-readable resource lists when a human-readable group would be too long.

## Audit summary

Include:

- scope and commit/diff when known;
- detected stacks and deployable components;
- confirmed findings by severity;
- posture findings by severity and control family when posture mode was requested;
- the evidence classes used and a control-coverage ledger (`pass`, `fail`, `not-applicable`, `unverified`) for cloud posture work;
- areas reviewed with no confirmed vulnerability;
- tooling executed and its limitations;
- untested surfaces and deployment assumptions;
- rejected high-signal candidates when explaining false-positive control is useful.

Never state that a codebase is secure. State what was reviewed and what was or was not found under the stated conditions.
