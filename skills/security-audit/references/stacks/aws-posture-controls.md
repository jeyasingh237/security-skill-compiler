# AWS posture control catalog

Read this catalog for every AWS posture or combined audit. It is a coverage floor, not a claim that every control is universally required.

## How to use the catalog

Create a ledger row for every control below and assign exactly one status:

- `pass`: effective in-scope evidence proves the control holds;
- `fail`: effective in-scope evidence proves an applicable control does not hold;
- `not-applicable`: the resource/service/data condition does not exist or the requested baseline excludes it; record why;
- `unverified`: the control may apply, but repository/plan/state/supplied/live evidence cannot decide it.

Evidence codes indicate where a conclusion normally comes from: `R` repository configuration, `P` resolved plan/state, `L` authorized live-account inventory, and `U` user-supplied inventory/report. A code is not permission to query AWS.

Do not convert `unverified` to `pass`. Do not infer an account-wide failure from the absence of a resource in one Terraform root. Conversely, when an in-scope managed resource exists, inspect its effective values and provider defaults; do not mark its controls unverified merely because live access is unavailable.

## Identity, credentials, and organization

| ID | Control to evaluate | Typical evidence |
|---|---|---|
| AWS-IAM-001 | IAM console users use MFA, with privileged identities prioritized | L/U |
| AWS-IAM-002 | IAM passwords and access keys unused beyond the requested threshold are disabled or removed | L/U |
| AWS-IAM-003 | Long-lived access keys are rotated, limited, and replaced by role credentials where feasible | R/P/L/U |
| AWS-IAM-004 | Account password policy meets the applicable baseline | L/U |
| AWS-IAM-005 | User, group, and role policies do not grant unnecessary wildcard or privilege-escalation paths | R/P/L/U |
| AWS-IAM-006 | `iam:PassRole` is limited by role, destination service, and caller need | R/P/L/U |
| AWS-IAM-007 | Service-role trust policies contain applicable confused-deputy conditions | R/P/L/U |
| AWS-IAM-008 | IAM Access Analyzer is enabled in required regions/accounts with findings reviewed | R/P/L/U |
| AWS-ORG-001 | Region-restriction SCPs exist when the organization requires region allowlisting | L/U |
| AWS-ORG-002 | Tag policies and required-tag enforcement exist when governance policy requires them | L/U |
| AWS-ORG-003 | Cross-account principals, OIDC subjects/audiences, external IDs, and organization conditions are narrowly scoped | R/P/L/U |

## Detection, auditability, and monitoring

| ID | Control to evaluate | Typical evidence |
|---|---|---|
| AWS-DET-001 | AWS Config recorder, delivery, and required rules/conformance packs cover all in-scope regions | R/P/L/U |
| AWS-DET-002 | GuardDuty is enabled with required organization/region/member coverage and notifications | R/P/L/U |
| AWS-DET-003 | Security Hub standards, aggregation, integrations, and notifications are enabled as required | R/P/L/U |
| AWS-DET-004 | Inspector scanning covers applicable EC2, ECR, and Lambda resources | R/P/L/U |
| AWS-DET-005 | CloudTrail records required regions, management events, and applicable data events | R/P/L/U |
| AWS-DET-006 | CloudTrail uses protected central delivery, log validation, encryption, retention, and alerts | R/P/L/U |
| AWS-DET-007 | VPC Flow Logs cover required VPCs/subnets/interfaces and reach a usable destination | R/P/L/U |
| AWS-DET-008 | Route 53 query/resolver logging is enabled where DNS auditability is required | R/P/L/U |
| AWS-LOG-001 | CloudWatch log groups containing sensitive data use appropriate KMS encryption | R/P/L/U |
| AWS-LOG-002 | Applicable CloudWatch log groups have data-protection policies | R/P/L/U |
| AWS-LOG-003 | Log retention is explicit and adequate; logs do not default to indefinite or premature deletion unintentionally | R/P/L/U |
| AWS-LOG-004 | Required security metric filters, alarms, and delivery targets exist | R/P/L/U |
| AWS-LOG-005 | Log resources have applicable deletion protection/immutability and restrictive resource policies | R/P/L/U |

## Network, edge, and public exposure

| ID | Control to evaluate | Typical evidence |
|---|---|---|
| AWS-NET-001 | Security groups do not expose SSH/RDP or administrative/database ports to untrusted CIDRs | R/P/L/U |
| AWS-NET-002 | Security groups do not expose all ports/protocols to untrusted CIDRs | R/P/L/U |
| AWS-NET-003 | Default and launch-wizard security groups are unused or restricted | R/P/L/U |
| AWS-NET-004 | NACL ordering and associations do not permit unnecessary internet ingress | R/P/L/U |
| AWS-NET-005 | EC2 instances have public IPs only when intentionally internet-facing and protected | R/P/L/U |
| AWS-NET-006 | Private/internal subnets do not auto-assign public IPv4 addresses | R/P/L/U |
| AWS-NET-007 | Public EC2 instances do not carry unnecessarily powerful instance profiles | R/P/L/U |
| AWS-NET-008 | VPC endpoint policies restrict principals, actions, resources, and cross-account use | R/P/L/U |
| AWS-NET-009 | Network firewall/egress inspection requirements from the selected baseline or threat model are met | R/P/L/U |
| AWS-NET-010 | EFS mount targets, policies, access points, and security groups prevent unintended network/principal access | R/P/L/U |
| AWS-NET-011 | Cleartext HTTP listeners/behaviors redirect to HTTPS or are explicitly justified | R/P/L/U |
| AWS-NET-012 | TLS policies, certificates, origin protocols, and backend connections meet the required minimum | R/P/L/U |

## EC2, metadata, and block storage

| ID | Control to evaluate | Typical evidence |
|---|---|---|
| AWS-EC2-001 | EC2 and launch templates require IMDSv2 with an appropriate response-hop limit | R/P/L/U |
| AWS-EC2-002 | EC2 detailed monitoring is enabled where required | R/P/L/U |
| AWS-EC2-003 | Stop protection is enabled for applicable critical instances | R/P/L/U |
| AWS-EC2-004 | Termination protection is enabled for applicable critical instances | R/P/L/U |
| AWS-EBS-001 | EBS default encryption is enabled in every in-scope region | L/U |
| AWS-EBS-002 | Attached and declared EBS volumes are encrypted with an appropriate key | R/P/L/U |
| AWS-EBS-003 | EBS snapshots are encrypted and are not publicly restorable or over-shared | P/L/U |
| AWS-EBS-004 | Critical EBS volumes have current snapshot/backup coverage and restore ownership | L/U |

## S3

| ID | Control to evaluate | Typical evidence |
|---|---|---|
| AWS-S3-001 | Account-level S3 Block Public Access is enabled where required | R/P/L/U |
| AWS-S3-002 | Bucket/access-point Block Public Access, ACLs, policies, and website settings match intended exposure | R/P/L/U |
| AWS-S3-003 | Bucket policies deny insecure transport | R/P/L/U |
| AWS-S3-004 | Default bucket encryption and KMS-key requirements match data classification | R/P/L/U |
| AWS-S3-005 | Versioning is enabled for recoverable or mutable critical data | R/P/L/U |
| AWS-S3-006 | Access logging or equivalent data-event auditability is enabled where required | R/P/L/U |
| AWS-S3-007 | MFA Delete is enabled where the operational model can support it and policy requires it | L/U |
| AWS-S3-008 | Object Lock/retention is enabled for data requiring immutable recovery or compliance retention | R/P/L/U |

## Load balancers, CloudFront, and certificates

| ID | Control to evaluate | Typical evidence |
|---|---|---|
| AWS-ELB-001 | ALB/NLB/Classic ELB access logs are enabled with a protected destination | R/P/L/U |
| AWS-ELB-002 | Internet-facing load balancers use WAF when required by exposure/data/threat model | R/P/L/U |
| AWS-ELB-003 | ALB drops invalid header fields where compatible and required | R/P/L/U |
| AWS-ELB-004 | Load-balancer deletion protection is enabled for critical production entry points | R/P/L/U |
| AWS-CF-001 | CloudFront redirects viewers to HTTPS or requires HTTPS | R/P/L/U |
| AWS-CF-002 | CloudFront uses HTTPS to custom origins and appropriate TLS policies | R/P/L/U |
| AWS-CF-003 | CloudFront standard or real-time logging is enabled where required | R/P/L/U |
| AWS-CF-004 | CloudFront uses WAF when required by exposure/data/threat model | R/P/L/U |
| AWS-CF-005 | Geo restrictions are configured only when business or policy scope requires them | R/P/L/U |
| AWS-CF-006 | Field-level encryption is used only for identified sensitive fields that require protection beyond TLS | R/P/L/U |
| AWS-CF-007 | Origins use OAC/OAI or an equivalent restrictive origin policy | R/P/L/U |
| AWS-ACM-001 | Certificates are valid, appropriately keyed, monitored, and owned for renewal before expiry | P/L/U |

## Databases, data services, messaging, and backups

| ID | Control to evaluate | Typical evidence |
|---|---|---|
| AWS-RDS-001 | Automated backups and adequate retention are enabled | R/P/L/U |
| AWS-RDS-002 | Storage and snapshots are encrypted with an appropriate KMS key | R/P/L/U |
| AWS-RDS-003 | Client TLS is enforced through engine parameters and client configuration | R/P/L/U |
| AWS-RDS-004 | Multi-AZ is enabled for production/critical availability requirements | R/P/L/U |
| AWS-RDS-005 | Deletion protection is enabled for production/critical databases | R/P/L/U |
| AWS-RDS-006 | Automatic minor-version upgrades/maintenance ownership meet patch policy | R/P/L/U |
| AWS-RDS-007 | Enhanced Monitoring is enabled where required | R/P/L/U |
| AWS-RDS-008 | Required engine/audit/error/slow-query logs are exported with retention and alerts | R/P/L/U |
| AWS-DDB-001 | DynamoDB point-in-time recovery is enabled for critical mutable data | R/P/L/U |
| AWS-DDB-002 | DynamoDB encryption/key ownership meets data-classification requirements | R/P/L/U |
| AWS-DDB-003 | DynamoDB deletion protection is enabled for critical tables | R/P/L/U |
| AWS-SNS-001 | SNS topics use appropriate KMS encryption and restrictive topic/subscription policies | R/P/L/U |
| AWS-SEC-001 | Secrets Manager secrets use restrictive policies/keys and rotate when technically applicable | R/P/L/U |
| AWS-BACKUP-001 | AWS Backup plans, assignments, vault protections, retention, copies, and restore tests cover critical resources | R/P/L/U |

## Serverless, containers, and workload definitions

| ID | Control to evaluate | Typical evidence |
|---|---|---|
| AWS-LAMBDA-001 | Function URLs/resource policies do not allow unintended anonymous invocation | R/P/L/U |
| AWS-LAMBDA-002 | Public functions have bounded concurrency, early authentication, and abuse/cost controls | R/P/L/U |
| AWS-LAMBDA-003 | Lambda logging is enabled, retained, protected, and alarmed as required | R/P/L/U |
| AWS-LAMBDA-004 | Lambda environment data contains no plaintext credentials and execution roles are least privilege | R/P/L/U |
| AWS-ECS-001 | ECS task definitions inject sensitive values through `secrets`, not plaintext `environment` entries | R/P/L/U |
| AWS-ECS-002 | Task/execution roles, command overrides, public IPs, metadata reachability, logs, and runtime privileges are restricted | R/P/L/U |
| AWS-ECR-001 | ECR scanning/enhanced scanning and vulnerability-response ownership cover active images | R/P/L/U |
| AWS-ECR-002 | ECR lifecycle policies safely expire obsolete/untagged images while preserving rollback needs | R/P/L/U |

## Completion gate

Before reporting, verify:

1. every row above has a status and evidence note;
2. every `fail` row appears as a posture finding, even if another control blocks immediate exploitation;
3. every `unverified` row appears in the coverage ledger with the missing evidence named;
4. independently actionable failures are not swallowed by one umbrella incident merely because they share an artifact or credential source;
5. duplicate symptoms with the same affected resources, cause, owner, and remediation are grouped once.
