#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FRAMEWORK_TOKENS, IGNORED_DIRECTORIES, STACK_CATALOG } from "./stack-catalog.mjs";

const MANIFEST_NAMES = new Set([
  "package.json",
  "deno.json",
  "deno.jsonc",
  "pyproject.toml",
  "requirements.txt",
  "Pipfile",
  "setup.py",
  "go.mod",
  "Cargo.toml",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "composer.json",
  "Gemfile",
  "CMakeLists.txt",
  "Chart.yaml",
  "Pulumi.yaml",
  "cdk.json",
  "samconfig.toml"
]);

const MANIFEST_STACKS = {
  "package.json": "javascript-typescript",
  "deno.json": "javascript-typescript",
  "deno.jsonc": "javascript-typescript",
  "pyproject.toml": "python",
  "requirements.txt": "python",
  Pipfile: "python",
  "setup.py": "python",
  "go.mod": "go",
  "Cargo.toml": "rust",
  "pom.xml": "java-kotlin",
  "build.gradle": "java-kotlin",
  "build.gradle.kts": "java-kotlin",
  "composer.json": "php",
  Gemfile: "ruby",
  "CMakeLists.txt": "native",
  "Chart.yaml": "infrastructure",
  "Pulumi.yaml": "infrastructure"
};

function makeState() {
  return Object.fromEntries(
    STACK_CATALOG.map((stack) => [stack.id, { score: 0, signals: new Set(), frameworks: new Set() }])
  );
}

function addSignal(state, id, score, signal) {
  const entry = state[id];
  if (!entry) return;
  entry.score += score;
  entry.signals.add(signal);
}

async function readSmallFile(filename, maxBytes = 1_000_000) {
  try {
    const stat = await fs.stat(filename);
    if (!stat.isFile() || stat.size > maxBytes) return "";
    return await fs.readFile(filename, "utf8");
  } catch {
    return "";
  }
}

const selfSkillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function walkRepository(root, maxFiles) {
  const files = [];
  const pending = [root];
  let truncated = false;

  while (pending.length > 0) {
    const directory = pending.pop();
    let entries;
    try {
      entries = await fs.readdir(directory, { withFileTypes: true });
    } catch {
      continue;
    }

    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (files.length >= maxFiles) {
        truncated = true;
        pending.length = 0;
        break;
      }

      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name) && path.resolve(absolute) !== selfSkillRoot) pending.push(absolute);
      } else if (entry.isFile()) {
        files.push({ absolute, relative: path.relative(root, absolute).split(path.sep).join("/") });
      }
    }
  }

  return { files, truncated };
}

function dependencyTextFromPackageJson(raw) {
  try {
    const parsed = JSON.parse(raw);
    return JSON.stringify({
      dependencies: parsed.dependencies,
      devDependencies: parsed.devDependencies,
      optionalDependencies: parsed.optionalDependencies,
      peerDependencies: parsed.peerDependencies,
      scripts: parsed.scripts
    }).toLowerCase();
  } catch {
    return raw.toLowerCase();
  }
}

function containsToken(text, token) {
  if (/^[a-z0-9]+$/i.test(token)) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[\\s"'=:,;()[\\]{}])${escaped}(?=$|[\\s"'=:,;()[\\]{}<>])`, "i").test(text);
  }
  return text.includes(token.toLowerCase());
}

function addFrameworkMatches(state, stackId, text, source) {
  for (const [token, label] of FRAMEWORK_TOKENS[stackId] ?? []) {
    if (containsToken(text, token)) {
      state[stackId].frameworks.add(label);
      state[stackId].signals.add(`${label} in ${source}`);
      state[stackId].score += 1;
    }
  }
}

function confidenceFor(score) {
  if (score >= 6) return "high";
  if (score >= 3) return "medium";
  return "low";
}

export async function detectRepository(root = process.cwd(), options = {}) {
  const resolvedRoot = path.resolve(root);
  const maxFiles = options.maxFiles ?? 25_000;
  const state = makeState();
  const extensionCounts = new Map();
  const { files, truncated } = await walkRepository(resolvedRoot, maxFiles);
  const manifests = [];
  const allDependencyText = [];

  for (const file of files) {
    const basename = path.basename(file.relative);
    const extension = path.extname(basename).toLowerCase();
    extensionCounts.set(extension, (extensionCounts.get(extension) ?? 0) + 1);

    if (MANIFEST_NAMES.has(basename) || /\.(?:csproj|fsproj|vbproj)$/i.test(basename)) {
      manifests.push(file);
    }

    if (basename === "Dockerfile" || basename.startsWith("Dockerfile.")) {
      addSignal(state, "infrastructure", 4, file.relative);
      state.infrastructure.frameworks.add("Docker");
    }
    if (/^(?:docker-)?compose(?:\.[^.]+)?\.ya?ml$/i.test(basename)) {
      addSignal(state, "infrastructure", 4, file.relative);
      state.infrastructure.frameworks.add("Docker");
    }
    if (extension === ".tf" || extension === ".hcl") {
      addSignal(state, "infrastructure", 1, `${extension} source files`);
      state.infrastructure.frameworks.add("Terraform");
    }
    if (
      extension === ".tf" ||
      extension === ".hcl" ||
      basename === "cdk.json" ||
      basename === "samconfig.toml" ||
      /^(?:serverless|template)(?:\.[^.]+)?\.(?:ya?ml|json)$/i.test(basename) ||
      /cloudformation/i.test(file.relative)
    ) {
      const cloudConfiguration = (await readSmallFile(file.absolute)).toLowerCase();
      if (/provider\s+["']aws["']|\baws_[a-z0-9_]+\b|arn:aws(?:-[a-z]+)?:/.test(cloudConfiguration)) {
        addSignal(state, "aws", 4, `AWS configuration in ${file.relative}`);
        state.aws.frameworks.add(extension === ".tf" || extension === ".hcl" ? "Terraform AWS Provider" : "AWS configuration");
      }
      if (/aws::[a-z0-9]+::[a-z0-9]+/i.test(cloudConfiguration)) {
        addSignal(state, "aws", 4, `CloudFormation resources in ${file.relative}`);
        state.aws.frameworks.add("AWS CloudFormation");
      }
      if (basename === "cdk.json") {
        addSignal(state, "aws", 5, file.relative);
        state.aws.frameworks.add("AWS CDK");
      }
      if (basename === "samconfig.toml" || /transform\s*:\s*aws::serverless/i.test(cloudConfiguration)) {
        addSignal(state, "aws", 5, `AWS SAM in ${file.relative}`);
        state.aws.frameworks.add("AWS SAM");
      }
      if (/^service\s*:/im.test(cloudConfiguration) && /provider\s*:\s*\n?\s*name\s*:\s*aws/im.test(cloudConfiguration) && /serverless/i.test(basename)) {
        addSignal(state, "aws", 4, `Serverless Framework in ${file.relative}`);
        state.aws.frameworks.add("Serverless Framework");
      }
    }
    if (file.relative.startsWith(".github/workflows/") && /\.ya?ml$/i.test(basename)) {
      addSignal(state, "infrastructure", 3, ".github/workflows");
      state.infrastructure.frameworks.add("GitHub Actions");
    }
    if ((/\b(?:k8s|kubernetes|manifests)\b/i.test(file.relative) && /\.ya?ml$/i.test(basename))) {
      addSignal(state, "infrastructure", 2, `Kubernetes manifest ${file.relative}`);
      state.infrastructure.frameworks.add("Kubernetes");
    }
  }

  for (const stack of STACK_CATALOG) {
    const count = stack.sourceExtensions.reduce((sum, extension) => sum + (extensionCounts.get(extension) ?? 0), 0);
    if (count > 0) addSignal(state, stack.id, Math.min(4, 2 + Math.floor(Math.log10(count))), `${count} source file${count === 1 ? "" : "s"}`);
  }

  for (const manifest of manifests) {
    const basename = path.basename(manifest.relative);
    const raw = await readSmallFile(manifest.absolute);
    let stackId = MANIFEST_STACKS[basename];
    if (!stackId && /\.(?:csproj|fsproj|vbproj)$/i.test(basename)) stackId = "dotnet";
    if (!stackId) continue;

    addSignal(state, stackId, 6, manifest.relative);
    const normalized = basename === "package.json" ? dependencyTextFromPackageJson(raw) : raw.toLowerCase();
    allDependencyText.push(`${manifest.relative}\n${normalized}`);
    addFrameworkMatches(state, stackId, normalized, manifest.relative);

    if (basename === "Chart.yaml") state.infrastructure.frameworks.add("Helm");
    if (basename === "Pulumi.yaml") state.infrastructure.frameworks.add("Pulumi");
  }

  const combinedDependencies = allDependencyText.join("\n");
  const awsFrameworksBeforeDependencies = state.aws.frameworks.size;
  addFrameworkMatches(state, "aws", combinedDependencies, "dependency manifests");
  if (state.aws.frameworks.size > awsFrameworksBeforeDependencies) {
    addSignal(state, "aws", 5, "AWS dependencies");
  }
  addFrameworkMatches(state, "ai-llm", combinedDependencies, "dependency manifests");
  if (state["ai-llm"].frameworks.size > 0) {
    addSignal(state, "ai-llm", 5, "AI/LLM dependencies");
  }

  const catalogOrder = new Map(STACK_CATALOG.map((stack, index) => [stack.id, index]));
  const stacks = STACK_CATALOG
    .filter((stack) => state[stack.id].score >= 2)
    .map((stack) => ({
      id: stack.id,
      label: stack.label,
      confidence: confidenceFor(state[stack.id].score),
      score: state[stack.id].score,
      frameworks: [...state[stack.id].frameworks].sort(),
      signals: [...state[stack.id].signals].sort(),
      reference: stack.reference
    }))
    .sort((a, b) => b.score - a.score || catalogOrder.get(a.id) - catalogOrder.get(b.id));

  return {
    schemaVersion: 1,
    root: resolvedRoot,
    scannedFiles: files.length,
    truncated,
    primaryStack: stacks.find((stack) => !["infrastructure", "aws", "ai-llm"].includes(stack.id))?.id ?? stacks[0]?.id ?? null,
    stacks
  };
}

export function formatDetectionMarkdown(detection) {
  const lines = [
    "# Detected security-audit profile",
    "",
    `Scanned ${detection.scannedFiles} files${detection.truncated ? " (scan limit reached)" : ""}.`,
    ""
  ];

  if (detection.stacks.length === 0) {
    lines.push("No supported stack was detected. Use the common audit methodology and inspect the repository manually.", "");
    return lines.join("\n");
  }

  lines.push("| Stack | Confidence | Frameworks | Evidence | Load |", "|---|---|---|---|---|");
  for (const stack of detection.stacks) {
    lines.push(
      `| ${stack.label} | ${stack.confidence} | ${stack.frameworks.join(", ") || "—"} | ${stack.signals.join("; ")} | \`${stack.reference}\` |`
    );
  }
  lines.push("", "Treat this profile as routing evidence, not proof that every detected framework is reachable in production.", "");
  return lines.join("\n");
}

async function main(argv) {
  let root = process.cwd();
  let format = "json";
  let maxFiles = 25_000;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--root") root = argv[++index];
    else if (argument === "--format") format = argv[++index];
    else if (argument === "--max-files") maxFiles = Number(argv[++index]);
    else if (argument === "--help" || argument === "-h") {
      console.log("Usage: detect-stack.mjs [--root PATH] [--format json|markdown] [--max-files N]");
      return;
    } else if (!argument.startsWith("-")) root = argument;
    else throw new Error(`Unknown option: ${argument}`);
  }

  const detection = await detectRepository(root, { maxFiles });
  if (format === "markdown") console.log(formatDetectionMarkdown(detection));
  else if (format === "json") console.log(JSON.stringify(detection, null, 2));
  else throw new Error(`Unsupported format: ${format}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(`detect-stack: ${error.message}`);
    process.exitCode = 1;
  });
}
