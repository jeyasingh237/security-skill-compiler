# Infrastructure and CI audit module

## Establish deployment ownership

Identify which configuration is production-owned, environment overlays, modules/charts, CI workflows, image build files, secrets providers, cloud accounts/projects, and deployment entry points. Generated examples and local development manifests are not automatically production scope.

## Terraform, Pulumi, and cloud configuration

- Trace identities, trust policies, role assumption, service accounts, workload identity, and cross-account/project access. Look for wildcard actions/resources with a reachable escalation path.
- Check public ingress/egress, security-group/firewall composition, private endpoint assumptions, metadata access, DNS, load balancers, and admin/control-plane exposure.
- Review storage/database public access, tenant boundaries, encryption/key policies, backups/snapshots, logs, and deletion protection when their absence enables concrete impact.
- Treat state and plan output as sensitive. Check remote-state access, locking, CI artifacts, outputs, and secrets embedded in variables/user data.
- Follow module inputs through defaults and environment overlays; a safe module can be instantiated unsafely and vice versa.

## Kubernetes and Helm

- Review RBAC verbs/resources, impersonation, bind/escalate rights, service-account token mounting, workload identity, and namespace boundaries.
- Check privileged containers, host namespaces, hostPath, device access, capabilities, seccomp/AppArmor/SELinux, writable roots, and run-as identity in the effective rendered manifest.
- Inspect admission controls, network policies, ingress annotations, external services, secrets/config maps, image provenance/tags, and cross-namespace references.
- Render Helm/Kustomize overlays before deciding effective security posture. Validate user-controlled chart values that enter templates or commands.

## Containers

- Check build context and `.dockerignore`, secret mounts versus copied credentials, remote downloads and checksum/signature validation, unpinned mutable images, and package install scripts.
- Review runtime user, capabilities, mounts, socket access, entrypoint argument handling, health checks, and whether the container boundary is treated as stronger than the deployed runtime provides.

## CI/CD

- Map event type and code trust. Pull-request code, branch names, issue text, artifact names/content, and workflow outputs are untrusted.
- Review `pull_request_target`, privileged workflow chaining, checkout of untrusted refs, script interpolation, cache/artifact poisoning, self-hosted runners, environment approvals, and OIDC subject/audience conditions.
- Minimize workflow/token permissions and secret exposure. Pin executable third-party actions by immutable commit where supply-chain integrity is a required boundary.
- Check release provenance, signing, package publish rights, and whether untrusted build steps can alter artifacts after review.

## Avoid false positives

- Missing hardening settings are not vulnerabilities without a concrete threat and path. Separate benchmark compliance from exploit findings.
- Encrypted resources can still expose data through IAM; public routing can still be protected by strong application auth. Analyze composed controls.
- Examples, tests, and disabled environments do not establish production reachability.

## Upstream references

- [Kubernetes security checklist source](https://github.com/kubernetes/website/blob/main/content/en/docs/concepts/security/security-checklist.md)
- [Kubernetes Pod Security Standards source](https://github.com/kubernetes/website/blob/main/content/en/docs/concepts/security/pod-security-standards.md)
- [Trivy](https://github.com/aquasecurity/trivy)
- [Checkov](https://github.com/bridgecrewio/checkov)
- [Docker Bench for Security](https://github.com/docker/docker-bench-security)
- [GitHub Actions security hardening documentation source](https://github.com/github/docs/tree/main/content/actions/security-for-github-actions)
