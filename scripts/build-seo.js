#!/usr/bin/env node

"use strict";

const { parseArguments, runBuild } = require("./build-instances.js");

try {
  const options = parseArguments(process.argv.slice(2));

  if (options.instanceId && options.instanceId !== "bellavista") {
    throw new Error(
      "build-seo.js ist der Bellavista-Kompatibilitätswrapper. " +
      "Für andere Instanzen bitte build-instances.js verwenden."
    );
  }

  const results = runBuild({
    ...options,
    instanceId: "bellavista"
  });

  console.log(`Bellavista-SEO über Multi-Instance-Generator aktualisiert (${results.length} Build).`);
} catch (error) {
  console.error(`SEO-Generierung abgebrochen: ${error.message}`);
  process.exitCode = 1;
}
