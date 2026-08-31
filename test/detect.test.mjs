import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { detectRepository, formatDetectionMarkdown } from "../skills/security-audit/scripts/detect-stack.mjs";

async function fixture(files) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ssc-detect-"));
  for (const [relative, contents] of Object.entries(files)) {
    const destination = path.join(root, relative);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, contents, "utf8");
  }
  return root;
}

test("detects mixed stacks, frameworks, infrastructure, and AI overlays", async (context) => {
  const root = await fixture({
    "package.json": JSON.stringify({ dependencies: { next: "15.0.0", openai: "4.0.0" } }),
    "apps/web/page.tsx": "export default function Page() { return null }",
    "services/admin/pyproject.toml": "[project]\ndependencies = ['django']\n",
    "services/admin/app.py": "from django.http import HttpResponse\n",
    "Dockerfile": "FROM node:22-alpine\n",
    ".github/workflows/test.yml": "name: test\n"
  });
  context.after(() => fs.rm(root, { recursive: true, force: true }));

  const detection = await detectRepository(root);
  const byId = Object.fromEntries(detection.stacks.map((stack) => [stack.id, stack]));
  assert.equal(detection.primaryStack, "javascript-typescript");
  assert.ok(byId["javascript-typescript"].frameworks.includes("Next.js"));
  assert.ok(byId.python.frameworks.includes("Django"));
  assert.ok(byId.infrastructure.frameworks.includes("Docker"));
  assert.ok(byId["ai-llm"].frameworks.includes("OpenAI SDK"));
  assert.match(formatDetectionMarkdown(detection), /references\/stacks\/javascript-typescript\.md/);
});

test("ignores generated agent skills and dependency directories", async (context) => {
  const root = await fixture({
    "go.mod": "module example.test/service\n\ngo 1.24\n",
    "main.go": "package main\nfunc main() {}\n",
    "node_modules/pkg/package.json": JSON.stringify({ dependencies: { next: "99.0.0" } }),
    ".agents/skills/example/reference.py": "import django\n",
    ".terraform/modules/example/main.tf": 'resource "aws_s3_bucket" "generated" {}\n',
    ".terragrunt-cache/example/main.tf": 'resource "aws_iam_role" "generated" {}\n'
  });
  context.after(() => fs.rm(root, { recursive: true, force: true }));

  const detection = await detectRepository(root);
  assert.equal(detection.primaryStack, "go");
  assert.equal(detection.stacks.some((stack) => stack.id === "javascript-typescript"), false);
  assert.equal(detection.stacks.some((stack) => stack.id === "python"), false);
  assert.equal(detection.stacks.some((stack) => stack.id === "aws"), false);
});

test("matches simple framework names as dependency tokens, not substrings", async (context) => {
  const root = await fixture({
    "package.json": JSON.stringify({ dependencies: { "next-auth": "4.0.0", "react-dom": "19.0.0" } }),
    "index.js": "export const value = true\n"
  });
  context.after(() => fs.rm(root, { recursive: true, force: true }));

  const detection = await detectRepository(root);
  const javascript = detection.stacks.find((stack) => stack.id === "javascript-typescript");
  assert.ok(javascript);
  assert.equal(javascript.frameworks.includes("Next.js"), false);
  assert.equal(javascript.frameworks.includes("React"), false);
});

test("detects AWS IaC separately from generic infrastructure", async (context) => {
  const root = await fixture({
    "envs/production/main.tf": `
      terraform { required_providers { aws = { source = "hashicorp/aws" } } }
      provider "aws" { region = "us-east-1" }
      resource "aws_s3_bucket" "assets" { bucket = "example-assets" }
    `
  });
  context.after(() => fs.rm(root, { recursive: true, force: true }));

  const detection = await detectRepository(root);
  const byId = Object.fromEntries(detection.stacks.map((stack) => [stack.id, stack]));
  assert.ok(byId.infrastructure.frameworks.includes("Terraform"));
  assert.ok(byId.aws.frameworks.includes("Terraform AWS Provider"));
  assert.equal(byId.aws.reference, "references/stacks/aws.md");
});

test("does not infer AWS from non-AWS Terraform", async (context) => {
  const root = await fixture({
    "main.tf": `
      terraform { required_providers { google = { source = "hashicorp/google" } } }
      resource "google_storage_bucket" "assets" { name = "example-assets" }
    `
  });
  context.after(() => fs.rm(root, { recursive: true, force: true }));

  const detection = await detectRepository(root);
  assert.ok(detection.stacks.some((stack) => stack.id === "infrastructure"));
  assert.equal(detection.stacks.some((stack) => stack.id === "aws"), false);
});

test("detects AWS from a single SDK dependency", async (context) => {
  const root = await fixture({
    "requirements.txt": "boto3==1.40.0\n",
    "handler.py": "import boto3\n"
  });
  context.after(() => fs.rm(root, { recursive: true, force: true }));

  const detection = await detectRepository(root);
  const aws = detection.stacks.find((stack) => stack.id === "aws");
  assert.ok(aws);
  assert.ok(aws.frameworks.includes("AWS SDK"));
});

test("caps verbose profile evidence without dropping detection", async (context) => {
  const files = Object.fromEntries(Array.from({ length: 12 }, (_, index) => [
    `services/service-${index}.tf`,
    `resource "aws_s3_bucket" "bucket_${index}" { bucket = "bucket-${index}" }\n`
  ]));
  const root = await fixture(files);
  context.after(() => fs.rm(root, { recursive: true, force: true }));

  const detection = await detectRepository(root);
  assert.ok(detection.stacks.some((stack) => stack.id === "aws"));
  assert.match(formatDetectionMarkdown(detection), /more signals/);
});
