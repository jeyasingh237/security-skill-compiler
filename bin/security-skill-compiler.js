#!/usr/bin/env node

import { runCli } from "../src/cli.mjs";

runCli(process.argv.slice(2)).catch((error) => {
  console.error(`security-skill-compiler: ${error.message}`);
  process.exitCode = 1;
});
