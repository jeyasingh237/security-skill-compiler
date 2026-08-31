import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { compileSkill } from "../src/compiler.mjs";

test("compiles a pruned, repository-specific skill", async (context) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ssc-compile-target-"));
  const output = await fs.mkdtemp(path.join(os.tmpdir(), "ssc-compile-output-"));
  context.after(() => Promise.all([
    fs.rm(root, { recursive: true, force: true }),
    fs.rm(output, { recursive: true, force: true })
  ]));
  await fs.writeFile(path.join(root, "Cargo.toml"), "[package]\nname = 'demo'\nversion = '0.1.0'\n[dependencies]\naxum = '0.8'\n", "utf8");
  await fs.writeFile(path.join(root, "main.rs"), "fn main() {}\n", "utf8");

  const result = await compileSkill({ targetRoot: root, outputRoot: output });
  assert.equal(result.detection.primaryStack, "rust");
  assert.match(await fs.readFile(path.join(result.destination, "STACK_PROFILE.md"), "utf8"), /Axum/);
  assert.equal(await fs.stat(path.join(result.destination, "references/stacks/rust.md")).then(() => true), true);
  assert.equal(await fs.stat(path.join(result.destination, "references/web-application.md")).then(() => true), true);
  assert.equal(await fs.stat(path.join(result.destination, "references/stacks/python.md")).then(() => true, () => false), false);
  assert.equal(await fs.stat(path.join(result.destination, "references/stacks/aws-posture-controls.md")).then(() => true, () => false), false);
  const manifest = JSON.parse(await fs.readFile(path.join(result.destination, "compiler-manifest.json"), "utf8"));
  assert.equal(manifest.compiler, "security-skill-compiler");
});

test("does not overwrite an unmanaged skill without force", async (context) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ssc-compile-unmanaged-"));
  const output = path.join(root, "out");
  context.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.writeFile(path.join(root, "go.mod"), "module example.test/demo\n", "utf8");
  await fs.mkdir(path.join(output, "security-audit"), { recursive: true });
  await fs.writeFile(path.join(output, "security-audit/SKILL.md"), "user content\n", "utf8");

  await assert.rejects(() => compileSkill({ targetRoot: root, outputRoot: output }), /Refusing to overwrite unmanaged skill/);
  assert.equal(await fs.readFile(path.join(output, "security-audit/SKILL.md"), "utf8"), "user content\n");
});

test("includes AWS guidance only for detected AWS repositories", async (context) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ssc-compile-aws-target-"));
  const output = await fs.mkdtemp(path.join(os.tmpdir(), "ssc-compile-aws-output-"));
  context.after(() => Promise.all([
    fs.rm(root, { recursive: true, force: true }),
    fs.rm(output, { recursive: true, force: true })
  ]));
  await fs.writeFile(path.join(root, "main.tf"), 'provider "aws" { region = "us-east-1" }\nresource "aws_lambda_function" "job" { function_name = "job" }\n', "utf8");

  const result = await compileSkill({ targetRoot: root, outputRoot: output });
  assert.equal(await fs.stat(path.join(result.destination, "references/stacks/aws.md")).then(() => true), true);
  assert.equal(await fs.stat(path.join(result.destination, "references/stacks/aws-posture-controls.md")).then(() => true), true);
  assert.ok(result.detection.stacks.some((stack) => stack.id === "aws"));
  const manifest = JSON.parse(await fs.readFile(path.join(result.destination, "compiler-manifest.json"), "utf8"));
  assert.deepEqual(manifest.stacks.find((stack) => stack.id === "aws").supportingReferences, ["references/stacks/aws-posture-controls.md"]);
});
