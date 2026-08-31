import path from "node:path";
import { compileSkill } from "./compiler.mjs";
import { HARNESS_PATHS, installSkill } from "./install.mjs";
import { VERSION } from "./version.mjs";
import { detectRepository, formatDetectionMarkdown } from "../skills/security-audit/scripts/detect-stack.mjs";

const COMMANDS = new Set(["install", "compile", "detect", "harnesses", "help"]);

function help() {
  return `security-skill-compiler ${VERSION}

Compile repository-specific security audit skills and install them for coding-agent harnesses.

Usage:
  security-skill-compiler [install] [path] [options]
  security-skill-compiler detect [path] [--json]
  security-skill-compiler compile [path] [--output directory] [--force]
  security-skill-compiler harnesses [--json]

Install options:
  --harness <name[,name]>  auto, major, all, or a supported harness name
  --all-harnesses         Alias for --harness all
  --dry-run               Detect and list destinations without writing
  --force                 Replace an existing unmanaged security-audit skill
  --json                  Print machine-readable output
  --max-files <number>    Repository scan limit (default: 25000)

Examples:
  npx security-skill-compiler
  npx security-skill-compiler --all-harnesses
  npx security-skill-compiler install ./services/api --harness codex,claude-code
  npx security-skill-compiler detect . --json
`;
}

function parse(argv) {
  const first = argv[0];
  const command = COMMANDS.has(first) ? first : "install";
  const args = COMMANDS.has(first) ? argv.slice(1) : argv;
  const options = { command, positional: [], harnesses: [], json: false, force: false, dryRun: false, maxFiles: 25_000 };
  const takeValue = (flag, index) => {
    const value = args[index + 1];
    if (!value || value.startsWith("-")) throw new Error(`${flag} requires a value`);
    return value;
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--harness" || argument === "--agent") options.harnesses.push(takeValue(argument, index++));
    else if (argument === "--all-harnesses" || argument === "--all") options.harnesses = ["all"];
    else if (argument === "--output" || argument === "-o") options.output = takeValue(argument, index++);
    else if (argument === "--max-files") options.maxFiles = Number(takeValue(argument, index++));
    else if (argument === "--force") options.force = true;
    else if (argument === "--dry-run") options.dryRun = true;
    else if (argument === "--json") options.json = true;
    else if (argument === "--help" || argument === "-h") options.command = "help";
    else if (argument === "--version" || argument === "-v") options.command = "version";
    else if (argument.startsWith("-")) throw new Error(`Unknown option: ${argument}`);
    else options.positional.push(argument);
  }

  if (!Number.isInteger(options.maxFiles) || options.maxFiles < 1) throw new Error("--max-files must be a positive integer");
  if (options.positional.length > 1) throw new Error(`Unexpected argument: ${options.positional[1]}`);
  return options;
}

function compactDetection(detection) {
  return detection.stacks.map((stack) => `${stack.label}${stack.frameworks.length ? ` (${stack.frameworks.join(", ")})` : ""}`).join(", ") || "no supported stack detected";
}

export async function runCli(argv = process.argv.slice(2)) {
  const options = parse(argv);
  if (options.command === "help") {
    console.log(help());
    return;
  }
  if (options.command === "version") {
    console.log(VERSION);
    return;
  }
  if (options.command === "harnesses") {
    if (options.json) console.log(JSON.stringify(HARNESS_PATHS, null, 2));
    else {
      for (const [name, destination] of Object.entries(HARNESS_PATHS)) console.log(`${name.padEnd(20)} ${destination}`);
    }
    return;
  }

  const targetRoot = path.resolve(options.positional[0] ?? process.cwd());
  if (options.command === "detect") {
    const detection = await detectRepository(targetRoot, { maxFiles: options.maxFiles });
    console.log(options.json ? JSON.stringify(detection, null, 2) : formatDetectionMarkdown(detection));
    return;
  }

  if (options.command === "compile") {
    const outputRoot = path.resolve(options.output ?? path.join(targetRoot, ".security-skill-compiler", "skills"));
    const result = await compileSkill({ targetRoot, outputRoot, force: options.force, maxFiles: options.maxFiles });
    if (options.json) console.log(JSON.stringify({ destination: result.destination, detection: result.detection }, null, 2));
    else {
      console.log(`Detected: ${compactDetection(result.detection)}`);
      console.log(`Compiled: ${result.destination}`);
    }
    return;
  }

  const result = await installSkill({
    targetRoot,
    harnesses: options.harnesses.length > 0 ? options.harnesses : "auto",
    force: options.force,
    dryRun: options.dryRun,
    maxFiles: options.maxFiles
  });
  if (options.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`Detected: ${compactDetection(result.detection)}`);
    console.log(`${result.dryRun ? "Would install" : "Installed"} security-audit in ${result.installed.length} harness path${result.installed.length === 1 ? "" : "s"}:`);
    for (const destination of result.installed) console.log(`  ${destination}`);
  }
}
