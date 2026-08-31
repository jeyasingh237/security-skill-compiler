import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { compileSkill } from "./compiler.mjs";

export const HARNESS_PATHS = Object.freeze({
  universal: ".agents/skills",
  amp: ".agents/skills",
  replit: ".agents/skills",
  antigravity: ".agents/skills",
  "antigravity-cli": ".agents/skills",
  cline: ".agents/skills",
  dexto: ".agents/skills",
  "kimi-code-cli": ".agents/skills",
  loaf: ".agents/skills",
  warp: ".agents/skills",
  zed: ".agents/skills",
  codex: ".agents/skills",
  cursor: ".agents/skills",
  deepagents: ".agents/skills",
  firebender: ".agents/skills",
  "gemini-cli": ".agents/skills",
  "github-copilot": ".agents/skills",
  opencode: ".agents/skills",
  promptscript: ".agents/skills",
  "claude-code": ".claude/skills",
  "aider-desk": ".aider-desk/skills",
  astrbot: "data/skills",
  "autohand-code": ".autohand/skills",
  augment: ".augment/skills",
  bob: ".bob/skills",
  openclaw: "skills",
  "codearts-agent": ".codeartsdoer/skills",
  codebuddy: ".codebuddy/skills",
  codemaker: ".codemaker/skills",
  codestudio: ".codestudio/skills",
  "command-code": ".commandcode/skills",
  continue: ".continue/skills",
  cortex: ".cortex/skills",
  crush: ".crush/skills",
  devin: ".devin/skills",
  droid: ".factory/skills",
  eve: "agent/skills",
  forgecode: ".forge/skills",
  goose: ".goose/skills",
  grok: ".grok/skills",
  "hermes-agent": ".hermes/skills",
  "inference-sh": ".inferencesh/skills",
  jazz: ".jazz/skills",
  junie: ".junie/skills",
  "iflow-cli": ".iflow/skills",
  kilo: ".kilocode/skills",
  kimchi: ".kimchi/skills",
  "kiro-cli": ".kiro/skills",
  kode: ".kode/skills",
  lingma: ".lingma/skills",
  mcpjam: ".mcpjam/skills",
  "minimax-code": ".minimax/skills",
  "mistral-vibe": ".vibe/skills",
  moxby: ".moxby/skills",
  mux: ".mux/skills",
  openhands: ".openhands/skills",
  ona: ".ona/skills",
  pi: ".pi/skills",
  "posit-assistant": ".posit/assistant/skills",
  qoder: ".qoder/skills",
  "qoder-cn": ".qoder/skills",
  "qwen-code": ".qwen/skills",
  reasonix: ".reasonix/skills",
  rovodev: ".rovodev/skills",
  roo: ".roo/skills",
  "tabnine-cli": ".tabnine/agent/skills",
  terramind: ".terramind/skills",
  tinycloud: ".tinycloud/skills",
  trae: ".trae/skills",
  "trae-cn": ".trae/skills",
  windsurf: ".windsurf/skills",
  zcode: ".zcode/skills",
  zencoder: ".zencoder/skills",
  zenflow: ".zencoder/skills",
  neovate: ".neovate/skills",
  pochi: ".pochi/skills",
  adal: ".adal/skills"
});

const MAJOR_HARNESSES = ["universal", "claude-code", "windsurf", "roo", "continue", "aider-desk"];

async function exists(filename) {
  try {
    await fs.access(filename);
    return true;
  } catch {
    return false;
  }
}

function uniquePaths(names) {
  return [...new Set(names.map((name) => HARNESS_PATHS[name]))];
}

export async function resolveHarnesses(selection = "auto", targetRoot = process.cwd()) {
  const root = path.resolve(targetRoot);
  const requested = Array.isArray(selection)
    ? selection.flatMap((value) => value.split(","))
    : String(selection).split(",");
  const names = requested.map((name) => name.trim()).filter(Boolean);

  if (names.length === 0 || names.includes("auto")) {
    const resolved = new Set([HARNESS_PATHS.universal]);
    for (const [name, relative] of Object.entries(HARNESS_PATHS)) {
      if (name === "universal" || relative === HARNESS_PATHS.universal) continue;
      const topDirectory = relative.split("/")[0];
      if (!topDirectory.startsWith(".")) continue;
      if (await exists(path.join(root, topDirectory))) resolved.add(relative);
    }
    return [...resolved].sort();
  }

  if (names.some((name) => name === "all" || name === "*")) {
    return [...new Set(Object.values(HARNESS_PATHS))].sort();
  }
  if (names.includes("major")) return uniquePaths(MAJOR_HARNESSES).sort();

  const unknown = names.filter((name) => !(name in HARNESS_PATHS));
  if (unknown.length > 0) throw new Error(`Unknown harness${unknown.length === 1 ? "" : "es"}: ${unknown.join(", ")}`);
  return uniquePaths(names).sort();
}

async function isManaged(destination) {
  try {
    const manifest = JSON.parse(await fs.readFile(path.join(destination, "compiler-manifest.json"), "utf8"));
    return manifest.compiler === "security-skill-compiler";
  } catch {
    return false;
  }
}

async function copyAtomically(source, destination, force) {
  const destinationExists = await exists(destination);
  if (destinationExists && !force && !(await isManaged(destination))) {
    throw new Error(`Refusing to overwrite unmanaged skill at ${destination}; pass --force to replace it`);
  }

  await fs.mkdir(path.dirname(destination), { recursive: true });
  const staged = `${destination}.stage-${process.pid}-${Date.now()}`;
  await fs.cp(source, staged, { recursive: true, force: true });
  if (!destinationExists) {
    await fs.rename(staged, destination);
    return;
  }

  const backup = `${destination}.backup-${process.pid}-${Date.now()}`;
  await fs.rename(destination, backup);
  try {
    await fs.rename(staged, destination);
    await fs.rm(backup, { recursive: true, force: true });
  } catch (error) {
    await fs.rm(staged, { recursive: true, force: true });
    if (await exists(destination)) await fs.rm(destination, { recursive: true, force: true });
    await fs.rename(backup, destination);
    throw error;
  }
}

export async function installSkill(options = {}) {
  const targetRoot = path.resolve(options.targetRoot ?? process.cwd());
  const harnessPaths = await resolveHarnesses(options.harnesses ?? "auto", targetRoot);

  if (options.dryRun) {
    const { detectRepository } = await import("../skills/security-audit/scripts/detect-stack.mjs");
    const detection = await detectRepository(targetRoot, { maxFiles: options.maxFiles });
    return {
      detection,
      installed: harnessPaths.map((relative) => path.join(targetRoot, relative, "security-audit")),
      dryRun: true
    };
  }

  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "security-skill-compiler-"));
  try {
    const compiled = await compileSkill({
      targetRoot,
      outputRoot: path.join(temporaryRoot, "skills"),
      maxFiles: options.maxFiles,
      force: true
    });
    const destinations = harnessPaths.map((relative) => path.join(targetRoot, relative, "security-audit"));
    if (!options.force) {
      for (const destination of destinations) {
        if (await exists(destination) && !(await isManaged(destination))) {
          throw new Error(`Refusing to overwrite unmanaged skill at ${destination}; pass --force to replace it`);
        }
      }
    }

    const installed = [];
    for (const destination of destinations) {
      await copyAtomically(compiled.destination, destination, options.force === true);
      installed.push(destination);
    }
    return { detection: compiled.detection, installed, dryRun: false };
  } finally {
    await fs.rm(temporaryRoot, { recursive: true, force: true });
  }
}
