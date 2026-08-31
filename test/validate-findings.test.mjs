import assert from "node:assert/strict";
import test from "node:test";
import { validateFindings } from "../skills/security-audit/scripts/validate-findings.mjs";

function validDocument() {
  return {
    schemaVersion: 1,
    target: { path: ".", scope: "repository", revision: null, stacks: ["go"] },
    summary: { critical: 0, high: 1, medium: 0, low: 0 },
    findings: [{
      id: "SSC-001",
      title: "Cross-tenant record update",
      severity: "high",
      confidence: "high",
      cwe: "CWE-639",
      location: { path: "api/update.go", line: 42 },
      attackerPrerequisites: "Authenticated tenant user",
      attackPath: ["Submit another tenant's record ID", "The handler updates it without an ownership check"],
      impact: "Modification of another tenant's data",
      evidence: "A local integration test updates the foreign record",
      remediation: "Authorize the record against the caller's tenant before mutation",
      validation: "Confirmed locally with isolated fixture data"
    }],
    coverage: [],
    limitations: [],
    hardeningNotes: [],
    rejectedCandidates: []
  };
}

test("accepts a coherent findings document", () => {
  assert.deepEqual(validateFindings(validDocument()), []);
});

test("rejects duplicate IDs and inconsistent summary counts", () => {
  const document = validDocument();
  document.findings.push({ ...document.findings[0] });
  const errors = validateFindings(document);
  assert.ok(errors.some((error) => /unique/.test(error)));
  assert.ok(errors.some((error) => /summary\.high/.test(error)));
});

test("rejects fields outside the published schema", () => {
  const document = validDocument();
  document.findings[0].scannerGuess = "critical";
  assert.ok(validateFindings(document).some((error) => /scannerGuess is not allowed/.test(error)));
});

test("accepts separately classified AWS posture findings", () => {
  const document = validDocument();
  document.postureSummary = { critical: 0, high: 0, medium: 1, low: 0, info: 0 };
  document.postureFindings = [{
    id: "SSC-P-001",
    title: "CloudTrail is disabled in one in-scope region",
    severity: "medium",
    confidence: "high",
    controlFamily: "Detection and logging",
    evidenceClass: "live-account",
    resources: ["account:example/region:us-east-1"],
    risk: "Administrative activity is not available for timely detection and investigation",
    evidence: "The authorized read-only inventory returned no trail covering the region",
    remediation: "Enable an organization or multi-region trail with protected central delivery",
    validation: "Read-only inventory completed with pagination",
    trafficImpact: "no",
    standardRefs: ["AWS Foundational Security Best Practices"]
  }];

  assert.deepEqual(validateFindings(document), []);
});

test("requires posture summary counts to match posture findings", () => {
  const document = validDocument();
  document.postureSummary = { critical: 0, high: 1, medium: 0, low: 0, info: 0 };
  document.postureFindings = [];
  assert.ok(validateFindings(document).some((error) => /postureSummary\.high/.test(error)));
});
