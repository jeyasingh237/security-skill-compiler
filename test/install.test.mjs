import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { installSkill, resolveHarnesses } from "../src/install.mjs";

test("deduplicates shared harness paths and installs managed copies", async (context) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ssc-install-"));
  context.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.writeFile(path.join(root, "package.json"), JSON.stringify({ dependencies: { express: "5.0.0" } }), "utf8");

  const harnessPaths = await resolveHarnesses(["codex", "cursor", "claude-code"], root);
  assert.deepEqual(harnessPaths, [".agents/skills", ".claude/skills"]);

  const first = await installSkill({ targetRoot: root, harnesses: ["codex", "cursor", "claude-code"] });
  assert.equal(first.installed.length, 2);
  for (const destination of first.installed) {
    assert.equal(await fs.stat(path.join(destination, "SKILL.md")).then(() => true), true);
  }

  const second = await installSkill({ targetRoot: root, harnesses: ["codex", "claude-code"] });
  assert.equal(second.installed.length, 2);
});

test("dry-run lists destinations without writing", async (context) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ssc-dry-run-"));
  context.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.writeFile(path.join(root, "go.mod"), "module example.test/demo\n", "utf8");

  const result = await installSkill({ targetRoot: root, harnesses: "codex", dryRun: true });
  assert.equal(result.dryRun, true);
  assert.equal(result.installed.length, 1);
  assert.equal(await fs.stat(result.installed[0]).then(() => true, () => false), false);
});

test("auto mode ignores ambiguous plain skills directories", async (context) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ssc-auto-"));
  context.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.mkdir(path.join(root, "skills"), { recursive: true });
  await fs.mkdir(path.join(root, ".claude"), { recursive: true });

  assert.deepEqual(await resolveHarnesses("auto", root), [".agents/skills", ".claude/skills"]);
});
