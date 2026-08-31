#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SEVERITIES = new Set(["critical", "high", "medium", "low"]);
const POSTURE_SEVERITIES = new Set(["critical", "high", "medium", "low", "info"]);
const CONFIDENCES = new Set(["high", "medium"]);
const POSTURE_CONFIDENCES = new Set(["high", "medium", "low"]);
const EVIDENCE_CLASSES = new Set(["repository", "plan-state", "live-account", "user-supplied"]);

function object(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function rejectUnknownKeys(value, allowed, prefix, errors) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) errors.push(`${prefix}${key} is not allowed`);
  }
}

export function validateFindings(document) {
  const errors = [];
  if (!object(document)) return ["root must be an object"];
  rejectUnknownKeys(document, new Set(["schemaVersion", "target", "summary", "findings", "postureSummary", "postureFindings", "coverage", "limitations", "hardeningNotes", "rejectedCandidates"]), "", errors);
  if (document.schemaVersion !== 1) errors.push("schemaVersion must equal 1");
  if (!object(document.target)) errors.push("target must be an object");
  else {
    rejectUnknownKeys(document.target, new Set(["path", "scope", "revision", "stacks"]), "target.", errors);
    if (!nonEmpty(document.target.path)) errors.push("target.path must be a non-empty string");
    if (!nonEmpty(document.target.scope)) errors.push("target.scope must be a non-empty string");
    if (!Array.isArray(document.target.stacks) || document.target.stacks.some((item) => !nonEmpty(item))) errors.push("target.stacks must be an array of non-empty strings");
  }
  if (!object(document.summary)) errors.push("summary must be an object");
  else {
    rejectUnknownKeys(document.summary, SEVERITIES, "summary.", errors);
    for (const severity of SEVERITIES) {
      if (!Number.isInteger(document.summary[severity]) || document.summary[severity] < 0) errors.push(`summary.${severity} must be a non-negative integer`);
    }
  }
  if (!Array.isArray(document.findings)) errors.push("findings must be an array");
  else {
    const ids = new Set();
    document.findings.forEach((finding, index) => {
      const prefix = `findings[${index}]`;
      if (!object(finding)) {
        errors.push(`${prefix} must be an object`);
        return;
      }
      rejectUnknownKeys(finding, new Set(["id", "title", "severity", "confidence", "cwe", "location", "attackerPrerequisites", "attackPath", "impact", "evidence", "remediation", "validation"]), `${prefix}.`, errors);
      if (!/^SSC-[0-9]{3,}$/.test(finding.id ?? "")) errors.push(`${prefix}.id must match SSC-NNN`);
      else if (ids.has(finding.id)) errors.push(`${prefix}.id must be unique`);
      else ids.add(finding.id);
      if (!nonEmpty(finding.title)) errors.push(`${prefix}.title must be a non-empty string`);
      if (!SEVERITIES.has(finding.severity)) errors.push(`${prefix}.severity is invalid`);
      if (!CONFIDENCES.has(finding.confidence)) errors.push(`${prefix}.confidence is invalid`);
      if (finding.cwe != null && !/^CWE-[0-9]+$/.test(finding.cwe)) errors.push(`${prefix}.cwe must match CWE-NNN or be null`);
      if (!object(finding.location) || !nonEmpty(finding.location.path) || !Number.isInteger(finding.location.line) || finding.location.line < 1) errors.push(`${prefix}.location must contain path and a positive line`);
      else rejectUnknownKeys(finding.location, new Set(["path", "line"]), `${prefix}.location.`, errors);
      for (const field of ["attackerPrerequisites", "impact", "evidence", "remediation", "validation"]) {
        if (!nonEmpty(finding[field])) errors.push(`${prefix}.${field} must be a non-empty string`);
      }
      if (!Array.isArray(finding.attackPath) || finding.attackPath.length < 2 || finding.attackPath.some((step) => !nonEmpty(step))) errors.push(`${prefix}.attackPath must contain at least two non-empty steps`);
    });

    if (object(document.summary)) {
      for (const severity of SEVERITIES) {
        const actual = document.findings.filter((finding) => finding?.severity === severity).length;
        if (document.summary[severity] !== actual) errors.push(`summary.${severity} is ${document.summary[severity]}, expected ${actual}`);
      }
    }
  }
  if ((document.postureSummary == null) !== (document.postureFindings == null)) {
    errors.push("postureSummary and postureFindings must be provided together");
  }
  if (document.postureSummary != null) {
    if (!object(document.postureSummary)) errors.push("postureSummary must be an object");
    else {
      rejectUnknownKeys(document.postureSummary, POSTURE_SEVERITIES, "postureSummary.", errors);
      for (const severity of POSTURE_SEVERITIES) {
        if (!Number.isInteger(document.postureSummary[severity]) || document.postureSummary[severity] < 0) errors.push(`postureSummary.${severity} must be a non-negative integer`);
      }
    }
  }
  if (document.postureFindings != null) {
    if (!Array.isArray(document.postureFindings)) errors.push("postureFindings must be an array");
    else {
      const ids = new Set();
      document.postureFindings.forEach((finding, index) => {
        const prefix = `postureFindings[${index}]`;
        if (!object(finding)) {
          errors.push(`${prefix} must be an object`);
          return;
        }
        rejectUnknownKeys(finding, new Set(["id", "title", "severity", "confidence", "controlFamily", "evidenceClass", "location", "resources", "risk", "evidence", "remediation", "validation", "trafficImpact", "standardRefs"]), `${prefix}.`, errors);
        if (!/^SSC-P-[0-9]{3,}$/.test(finding.id ?? "")) errors.push(`${prefix}.id must match SSC-P-NNN`);
        else if (ids.has(finding.id)) errors.push(`${prefix}.id must be unique`);
        else ids.add(finding.id);
        if (!nonEmpty(finding.title)) errors.push(`${prefix}.title must be a non-empty string`);
        if (!POSTURE_SEVERITIES.has(finding.severity)) errors.push(`${prefix}.severity is invalid`);
        if (!POSTURE_CONFIDENCES.has(finding.confidence)) errors.push(`${prefix}.confidence is invalid`);
        if (!nonEmpty(finding.controlFamily)) errors.push(`${prefix}.controlFamily must be a non-empty string`);
        if (!EVIDENCE_CLASSES.has(finding.evidenceClass)) errors.push(`${prefix}.evidenceClass is invalid`);
        if (finding.location != null) {
          if (!object(finding.location) || !nonEmpty(finding.location.path) || !Number.isInteger(finding.location.line) || finding.location.line < 1) errors.push(`${prefix}.location must contain path and a positive line`);
          else rejectUnknownKeys(finding.location, new Set(["path", "line"]), `${prefix}.location.`, errors);
        }
        if (!Array.isArray(finding.resources) || finding.resources.length < 1 || finding.resources.some((item) => !nonEmpty(item))) errors.push(`${prefix}.resources must contain at least one non-empty string`);
        for (const field of ["risk", "evidence", "remediation", "validation"]) {
          if (!nonEmpty(finding[field])) errors.push(`${prefix}.${field} must be a non-empty string`);
        }
        if (finding.trafficImpact != null && !["yes", "no", "unknown"].includes(finding.trafficImpact)) errors.push(`${prefix}.trafficImpact is invalid`);
        if (finding.standardRefs != null && (!Array.isArray(finding.standardRefs) || finding.standardRefs.some((item) => !nonEmpty(item)))) errors.push(`${prefix}.standardRefs must be an array of non-empty strings`);
      });

      if (object(document.postureSummary)) {
        for (const severity of POSTURE_SEVERITIES) {
          const actual = document.postureFindings.filter((finding) => finding?.severity === severity).length;
          if (document.postureSummary[severity] !== actual) errors.push(`postureSummary.${severity} is ${document.postureSummary[severity]}, expected ${actual}`);
        }
      }
    }
  }
  for (const field of ["coverage", "limitations", "hardeningNotes", "rejectedCandidates"]) {
    if (document[field] != null && (!Array.isArray(document[field]) || document[field].some((item) => typeof item !== "string"))) {
      errors.push(`${field} must be an array of strings`);
    }
  }
  return errors;
}

async function main(argv) {
  const filename = argv[0];
  if (!filename || filename === "--help" || filename === "-h") {
    console.log("Usage: validate-findings.mjs <findings.json>");
    return;
  }
  const document = JSON.parse(await fs.readFile(path.resolve(filename), "utf8"));
  const errors = validateFindings(document);
  if (errors.length > 0) {
    for (const error of errors) console.error(`- ${error}`);
    throw new Error(`${errors.length} validation error${errors.length === 1 ? "" : "s"}`);
  }
  console.log(`Valid findings document (${document.findings.length} finding${document.findings.length === 1 ? "" : "s"}).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(`validate-findings: ${error.message}`);
    process.exitCode = 1;
  });
}
