import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import test from "node:test";

test("AWS posture catalog has a unique, substantial control ledger", async () => {
  const source = await fs.readFile(new URL("../skills/security-audit/references/stacks/aws-posture-controls.md", import.meta.url), "utf8");
  const controls = [...source.matchAll(/^\| (AWS-[A-Z0-9-]+) \| ([^|]+) \| ([RPLU/]+) \|$/gm)]
    .map((match) => ({ id: match[1], description: match[2].trim(), evidence: match[3] }));

  assert.ok(controls.length >= 75, `expected at least 75 controls, found ${controls.length}`);
  assert.equal(new Set(controls.map((control) => control.id)).size, controls.length);
  assert.ok(controls.every((control) => control.description.length > 10));
  assert.ok(controls.every((control) => /^[RPLU](?:\/[RPLU])*$/.test(control.evidence)));
});
