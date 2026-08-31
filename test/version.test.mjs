import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import test from "node:test";
import { VERSION } from "../src/version.mjs";

test("CLI version matches package metadata", async () => {
  const packageJson = JSON.parse(await fs.readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(VERSION, packageJson.version);
});
