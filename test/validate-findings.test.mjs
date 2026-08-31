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
