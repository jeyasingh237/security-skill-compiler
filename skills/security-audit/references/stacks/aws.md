# AWS and IaC audit module

Use this module with the general infrastructure module. For a broad AWS or IaC request, perform both an exploitability review and a posture review unless the user asks for only one.

## Resolve what the evidence can prove

Assign every result one evidence class:

| Evidence class | What it can establish | Important limit |
|---|---|---|
| `repository` | Declared resources, module inputs, defaults, policies, and application consumers | Absence does not prove an account-level service or manually managed resource is absent |
| `plan-state` | Resolved Terraform values and resources known at plan/state time | May be stale, incomplete, or contain secrets; do not print sensitive values |
| `live-account` | Current resource configuration returned by authorized read-only APIs | Point-in-time evidence; record account, region coverage, API failures, and pagination |
| `user-supplied` | Scanner exports, inventory, screenshots, or manual report supplied for analysis | Preserve provenance and do not claim independent verification |

Use `unverified` rather than `failed` when the available evidence cannot decide a control. A repository-only review cannot confirm credential age, console MFA enrollment, enabled regional security services, certificate expiry, manually created resources, or drifted runtime settings.

Do not access a live AWS account merely because AWS IaC is present. Use live APIs only when the user authorizes that target and credentials are already available through an approved mechanism. Keep live checks read-only, enumerate every in-scope region, follow pagination, and record access-denied or unsupported-region responses as limitations rather than passing the control.

## Build effective configuration

1. Inventory accounts, regions, environments, Terraform roots/workspaces, modules, CloudFormation/SAM stacks, CDK apps, and deployment pipelines.
2. Follow module variables through defaults, environment overlays, locals, conditional resources, and provider aliases. Prefer a safely generated plan or existing redacted plan/state over judging an isolated module default.
3. Identify resources created outside the current root and controls implemented by organization policy, shared networking, account baselines, or deployment tooling.
4. Treat `.tfplan`, `tfstate`, crash logs, generated templates, user data, outputs, and CI artifacts as secret-bearing. Inspect locally and report secret types/counts without echoing values.
5. Reconcile IaC with live inventory when both are in scope. Label drift rather than silently choosing one source.

Static tools such as Checkov, Trivy, tfsec, `terraform validate`, provider schema inspection, and policy analyzers can seed candidates. Confirm effective values and applicability before reporting. Do not install tools or download providers unless the task permits it.

## Exploitability passes

Trace composed paths, not isolated flags:

- **Identity escalation:** principal/trust policy -> `sts:AssumeRole` or service action -> wildcard or sensitive permission -> `iam:PassRole`, policy mutation, credential creation, Lambda/ECS update, SSM command, scheduler/event injection, or cross-account access.
- **Public exposure:** route/DNS -> CDN/API Gateway/ALB/NLB/Lambda URL -> listener/behavior/resource policy/security group/NACL -> service authentication -> sensitive operation.
- **Workload pivot:** application compromise or SSRF -> task/instance metadata -> workload role -> data stores, secrets, queues, deployment roles, or control-plane actions.
- **Data exposure:** bucket/database/snapshot/log/topic/file-system policy and network path -> encryption/key policy -> reader/writer principal -> actual data sensitivity.
- **Automation boundary:** pull request, queue message, schedule, webhook, artifact, or model input -> privileged runner -> credentials/network -> deployment or production command sink.
- **Recovery-control abuse:** deletion, backup, snapshot, versioning, retention, object lock, or lifecycle configuration when an attacker with a realistic capability can destroy recovery options or make impact durable.

Public CIDRs, wildcard principals, and wildcard actions are starting points. Account for conditions, explicit denies, Block Public Access, organization SCPs, route reachability, protocol listeners, application authentication, and resource sensitivity before claiming exploitation.

## Posture coverage ledger

For posture or combined audits, maintain a ledger with one row per applicable control: control, scope, status (`pass`, `fail`, `not-applicable`, or `unverified`), evidence class, evidence location/resource, and validation note. This prevents an audit from silently skipping controls that require live inventory.

### Identity and organization

Review:

- inactive or unused IAM passwords/access keys, key age/rotation, multiple active keys, and replacement with temporary role credentials;
- MFA for console users, especially privileged users and roles assumable without MFA;
- account password policy and root-user protections;
- user/group/role policies, permissions boundaries, trust conditions, external IDs, OIDC/SAML subjects and audiences, service-linked roles, and cross-account principals;
- wildcard actions/resources with escalation significance, including `iam:PassRole` resource and `iam:PassedToService` restrictions;
- service-role trust policies for confused-deputy protections such as `aws:SourceArn`, `aws:SourceAccount`, organization, and service-specific condition keys;
- IAM Access Analyzer, organization-wide delegated administration, region-deny SCPs when required, and tag-policy/governance coverage.

Credential last-used data, MFA devices, root settings, Access Analyzer status, and organization policies normally require live-account or supplied evidence. Do not infer them from Terraform users alone. Deduplicate overlapping checks such as “unused credentials” and “unused keys” by credential and threshold.

### Detection, logging, and monitoring

Review account/region coverage and destinations for:

- multi-region CloudTrail, management and applicable data events, log-file validation, KMS protection, immutable/central storage, CloudWatch integration, and alerting;
- AWS Config recorder/delivery channel and applicable rules;
- GuardDuty, Security Hub standards/integrations, Inspector scan types, and finding export/notification;
- VPC Flow Logs and Route 53 resolver/query logging;
- CloudFront, ALB/NLB/Classic ELB, S3 access, API, and other edge/service access logs;
- CloudWatch log-group encryption, data-protection policies, retention, deletion protection where supported/required, and security metric filters/alarms;
- Lambda log-group/permission configuration, RDS log exports and Enhanced Monitoring, EC2 detailed monitoring, and ECR image scanning.

Distinguish “service disabled,” “resource logs disabled,” “logs enabled but unusable,” and “not visible in this repository.” Logging gaps are usually posture findings; elevate them to vulnerabilities only when they complete a concrete evasion or destructive path.

### Network and edge

Resolve the full path and review:

- security-group ingress for all ports and administrative/database ports, launch-wizard/default groups, source groups versus CIDRs, stale rules, and unrestricted egress with a reachable sink;
- NACL allow/deny ordering and subnet association; a broad NACL allow does not by itself expose a resource if routes and security groups block it;
- public IP assignment on instances and subnets, internet-gateway routes, NAT, endpoints, bastions/SSM, and instance profiles on public hosts;
- EC2 IMDSv2 enforcement, metadata hop limit, and whether containerized/untrusted workloads can reach metadata;
- VPC endpoint policies and principals/resources/actions;
- network firewall or equivalent egress/inspection architecture when required by the requested standard;
- EFS mount targets, security groups, file-system policy, access points, IAM authorization, root squash, encryption, and actual routability;
- load-balancer HTTP listeners, redirects, TLS policies/certificates, invalid-header dropping, access logs, WAF attachment, deletion protection, and backend protocol;
- CloudFront viewer protocol, origin protocol, WAF, logging, geo restrictions only when policy requires them, field-level encryption only for identified sensitive request fields, and origin access controls;
- ACM certificate status and expiry with renewal ownership.

Do not treat optional geo restrictions, CloudFront field-level encryption, a network firewall product, or WAF as universally required. Report them only when a stated baseline, threat model, or handled data makes the control applicable.

### Storage, data, and messaging

Review:

- S3 account- and bucket-level Block Public Access, ACLs, bucket/access-point policies, website endpoints, secure-transport denial, server-side encryption and KMS key policy, versioning, MFA Delete, object lock, access logging, replication, and lifecycle;
- EBS volume/default encryption, snapshot encryption and sharing, snapshot/backup coverage, KMS grants, and attachment to public or privileged instances;
- RDS public accessibility, subnet/security groups, storage encryption, KMS ownership, TLS enforcement parameters, automated backups/retention, Multi-AZ, deletion protection, auto-minor upgrades, log exports, Enhanced Monitoring, and snapshot sharing;
- DynamoDB encryption/key ownership, point-in-time recovery, deletion protection, backups, streams, and resource policies;
- SNS encryption, topic policies, HTTPS delivery, and cross-account subscriptions;
- Secrets Manager resource policies, KMS keys, rotation applicability/status, secret replication, and consuming identities;
- EFS encryption, policy/network exposure, backups, and lifecycle;
- AWS Backup plans, vault policy/lock, assignments, cross-account copies, restore testing, and uncovered resources.

“Not encrypted with a customer-managed KMS key” is different from “unencrypted.” State the actual condition and why a customer-managed key is required. Likewise, missing snapshots, Multi-AZ, deletion protection, object lock, versioning, or backup plans are resilience/posture issues unless tied to a realistic destructive capability and recovery impact.

### Compute, serverless, containers, and delivery

Review:

- Lambda function URLs and resource policies, authentication mode, `Principal`, `SourceArn`/`SourceAccount`, reserved concurrency, logging, environment secrets, code signing, VPC reachability, and execution-role permissions;
- ECS task-definition plaintext secrets versus `secrets` references, task/execution roles, command/environment overrides, public IPs, network mode, capabilities, logging, and metadata/credential isolation;
- EC2 public exposure, attached instance profiles, IMDSv2, user-data secrets, EBS encryption/backups, monitoring, patching, and stop/termination protection when required;
- ECR scan-on-push or enhanced scanning, mutable tags, repository policies, KMS encryption requirements, lifecycle policy, signatures/provenance, and retention of known-vulnerable images;
- schedulers, EventBridge, Step Functions, SQS/SNS, CodeBuild, deployment services, and CI identities that can pass roles or inject commands/messages into privileged workloads;
- RDS engine maintenance/upgrade settings and deprecated runtimes/images where version risk is in scope.

For public Lambda URLs, separate unauthenticated business endpoints from accidental exposure. Authentication that occurs inside the handler can still leave invocation cost/concurrency exposure before rejection.

## Validation and reporting rules

- Recalculate severity from exposure, data sensitivity, attacker prerequisites, blast radius, and compensating controls. Do not copy a scanner’s `HIGH`/`MEDIUM`/`LOW` label as the verdict.
- Keep availability/resilience, observability, cost/lifecycle, and compliance-only findings identifiable; they are not automatically exploitable vulnerabilities.
- Group identical control failures across resources when the cause and remediation are the same, but list every affected resource or provide a machine-readable attachment. Split findings when exposure, ownership, or remediation differs.
- Include production-traffic impact only when requested and use `yes`, `no`, or `unknown`; explain whether the value refers to remediation impact or current security impact.
- For live inventory, record account ID in redacted or user-approved form, regions queried, APIs used, collection time, pagination completion, and denied/failed calls.
- For plans/state, never reproduce secret values. If credentials appear, report type, count, status when safely knowable, and rotation scope.

## Authoritative references

Use current AWS service documentation and the target provider/module schema to verify behavior. Relevant starting points include:

- [AWS Security Hub Foundational Security Best Practices](https://docs.aws.amazon.com/securityhub/latest/userguide/fsbp-standard.html)
- [AWS Well-Architected Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html)
- [AWS Config conformance packs](https://docs.aws.amazon.com/config/latest/developerguide/conformance-packs.html)
- [AWS IAM security best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

Also use the applicable CIS AWS Foundations Benchmark and organization-specific policy supplied by the user. A baseline is a source of candidate controls, not proof that every control applies or failed.
