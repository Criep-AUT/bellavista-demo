#!/usr/bin/env node

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const seoUtils = require("../seo-utils.js");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const TEMPLATE_PATH = path.join(ROOT, "templates", "restaurant.html");
const MANIFEST_PATH = path.join(ROOT, "instances", "manifest.js");
const SHARED_FILES = ["style.css", "script.js", "seo-utils.js"];
const MODES = new Set(["demo", "staging", "production"]);
const OWNER_STATUSES = new Set(["draft", "review", "approved", "production"]);
const TEMPLATE_TOKENS = [
  "GENERATED_NOTICE",
  "LANGUAGE",
  "SEO_BLOCK",
  "PRESENTATION_NOTICE",
  "STYLE_PATH",
  "SEO_UTILS_PATH",
  "CONFIG_PATH",
  "SCRIPT_PATH"
];

function fail(message) {
  throw new Error(message);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeXml(value) {
  return escapeHtml(value).replaceAll("'", "&apos;");
}

function isPathInside(parentPath, candidatePath) {
  const relative = path.relative(parentPath, candidatePath);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function resolveProjectPath(relativePath, fieldName) {
  if (!seoUtils.isNonEmptyString(relativePath) || path.isAbsolute(relativePath)) {
    fail(`${fieldName} muss ein relativer Projektpfad sein.`);
  }

  const resolved = path.resolve(ROOT, relativePath);

  if (!isPathInside(ROOT, resolved)) {
    fail(`${fieldName} darf das Projektverzeichnis nicht verlassen.`);
  }

  return resolved;
}

function loadManifest() {
  delete require.cache[require.resolve(MANIFEST_PATH)];
  return require(MANIFEST_PATH);
}

function validateManifest(manifest, options = {}) {
  const checkFiles = options.checkFiles !== false;

  if (!Array.isArray(manifest)) {
    fail("Das Instanz-Manifest muss ein Array exportieren.");
  }

  const ids = new Set();
  const outputs = new Set();
  let rootDemoCount = 0;

  manifest.forEach((entry, index) => {
    const label = `Manifest-Eintrag ${index + 1}`;

    if (!seoUtils.isPlainObject(entry)) {
      fail(`${label} muss ein Objekt sein.`);
    }

    if (!seoUtils.isNonEmptyString(entry.id) || !/^[a-z0-9][a-z0-9-]*$/.test(entry.id)) {
      fail(`${label}: id muss klein geschrieben und URL-sicher sein.`);
    }

    if (ids.has(entry.id)) {
      fail(`Doppelte Instanz-ID im Manifest: ${entry.id}`);
    }
    ids.add(entry.id);

    if (typeof entry.enabled !== "boolean") {
      fail(`${entry.id}: enabled muss ein Boolean sein.`);
    }

    if (!MODES.has(entry.deploymentMode)) {
      fail(`${entry.id}: deploymentMode muss demo, staging oder production sein.`);
    }

    const configPath = resolveProjectPath(entry.config, `${entry.id}.config`);
    const outputPath = resolveProjectPath(entry.output, `${entry.id}.output`);

    if (!isPathInside(DIST, outputPath)) {
      fail(`${entry.id}.output muss innerhalb von dist/ liegen.`);
    }

    const normalizedOutput = path.normalize(outputPath).toLowerCase();
    if (outputs.has(normalizedOutput)) {
      fail(`${entry.id}: Output-Pfad ist bereits einer anderen Instanz zugeordnet.`);
    }
    outputs.add(normalizedOutput);

    if (checkFiles && (!fs.existsSync(configPath) || !fs.statSync(configPath).isFile())) {
      fail(`${entry.id}: Config-Datei nicht gefunden: ${entry.config}`);
    }

    if (entry.assets !== undefined) {
      const assetsPath = resolveProjectPath(entry.assets, `${entry.id}.assets`);
      if (checkFiles && (!fs.existsSync(assetsPath) || !fs.statSync(assetsPath).isDirectory())) {
        fail(`${entry.id}: Asset-Verzeichnis nicht gefunden: ${entry.assets}`);
      }
    }

    if (entry.rootDemo === true) {
      rootDemoCount += 1;
      if (!entry.enabled) fail(`${entry.id}: rootDemo muss aktiviert sein.`);
      if (entry.deploymentMode !== "demo") {
        fail(`${entry.id}: rootDemo ist ausschließlich im Demo-Modus zulässig.`);
      }
    } else if (entry.rootDemo !== false && entry.rootDemo !== undefined) {
      fail(`${entry.id}: rootDemo muss ein Boolean sein.`);
    }
  });

  if (rootDemoCount > 1) {
    fail("Im Manifest darf höchstens eine Instanz rootDemo sein.");
  }

  return manifest;
}

function loadConfig(configPath) {
  const source = fs.readFileSync(configPath, "utf8");
  const context = vm.createContext({ window: {} });

  new vm.Script(source, { filename: configPath }).runInContext(context, {
    timeout: 1000
  });

  if (!seoUtils.isPlainObject(context.window.restaurantConfig)) {
    fail(`${path.relative(ROOT, configPath)} stellt keine gültige window.restaurantConfig bereit.`);
  }

  return { config: context.window.restaurantConfig, source };
}

function cloneConfig(config) {
  return JSON.parse(JSON.stringify(config));
}

function applyDeploymentMode(config, mode) {
  const effectiveConfig = cloneConfig(config);
  effectiveConfig.seo = seoUtils.isPlainObject(effectiveConfig.seo)
    ? effectiveConfig.seo
    : {};

  if (mode === "staging") effectiveConfig.seo.robots = "noindex,nofollow";
  if (mode === "production") effectiveConfig.seo.robots = "index,follow";

  return effectiveConfig;
}

function validateConfig(config, model) {
  const errors = [];
  const warnings = [];
  const system = config.system;
  const identity = config.identity;
  const restaurant = config.restaurant;

  if (!seoUtils.isPlainObject(system)) {
    errors.push("system ist erforderlich.");
  } else {
    if (!seoUtils.isNonEmptyString(system.customerId)) errors.push("system.customerId fehlt.");
    if (!seoUtils.isNonEmptyString(system.templateVersion)) errors.push("system.templateVersion fehlt.");
    if (typeof system.demoMode !== "boolean") errors.push("system.demoMode muss ein Boolean sein.");
  }

  const fullName = seoUtils.resolveValue(
    identity,
    "fullName",
    seoUtils.resolveValue(restaurant, "fullName", "")
  );
  const city = seoUtils.resolveValue(
    identity,
    "city",
    seoUtils.resolveValue(restaurant, "city", "")
  );

  if (!seoUtils.isNonEmptyString(fullName)) errors.push("identity.fullName oder restaurant.fullName fehlt.");
  if (!seoUtils.isNonEmptyString(city)) errors.push("identity.city oder restaurant.city fehlt.");
  if (!seoUtils.isNonEmptyString(model.title)) errors.push("Es kann kein Seitentitel erzeugt werden.");
  if (!seoUtils.isNonEmptyString(model.description)) errors.push("Es kann keine Meta Description erzeugt werden.");
  if (!seoUtils.isPlainObject(model.schema) || model.schema["@type"] !== "Restaurant") {
    errors.push("Das Restaurant-Schema konnte nicht erzeugt werden.");
  }

  if (seoUtils.isPlainObject(restaurant) && !seoUtils.isNonEmptyString(restaurant.email)) {
    warnings.push("restaurant.email ist optional und kann leer bleiben.");
  }

  if (Array.isArray(config.signatureDishes)) {
    config.signatureDishes.forEach((dish, index) => {
      if (seoUtils.isPlainObject(dish) && !seoUtils.isNonEmptyString(dish.image)) {
        warnings.push(`signatureDishes[${index}].image ist leer. Der Medien-Fallback wird verwendet.`);
      }
    });
  }

  const instance = config.instance;
  if (seoUtils.isPlainObject(instance)) {
    if (
      instance.presentationMode !== undefined &&
      !["pitch", "standard"].includes(instance.presentationMode)
    ) {
      errors.push("instance.presentationMode muss pitch oder standard sein.");
    }

    if (instance.needsOwnerConfirmation !== undefined) {
      errors.push("instance.needsOwnerConfirmation ist veraltet; ownerConfirmation verwenden.");
    }

    if (
      instance.ownerConfirmation !== undefined &&
      !seoUtils.isPlainObject(instance.ownerConfirmation)
    ) {
      errors.push("instance.ownerConfirmation muss ein Objekt sein.");
    } else if (seoUtils.isPlainObject(instance.ownerConfirmation)) {
      Object.entries(instance.ownerConfirmation).forEach(([field, confirmed]) => {
        if (typeof confirmed !== "boolean") {
          errors.push(`instance.ownerConfirmation.${field} muss ein Boolean sein.`);
        }
      });
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

function validateProduction(config) {
  const errors = [];
  const instance = config.instance;
  const legal = config.legal;
  const domainIssues = seoUtils.getConfiguredDomainIssues(config);

  domainIssues.forEach((issue) => errors.push(issue.message));

  if (!seoUtils.isPlainObject(instance)) {
    errors.push("instance mit Freigabestatus fehlt.");
  } else {
    if (!OWNER_STATUSES.has(instance.status)) {
      errors.push("instance.status muss draft, review, approved oder production sein.");
    } else if (!["approved", "production"].includes(instance.status)) {
      errors.push("instance.status ist noch nicht approved oder production.");
    }

    if (instance.needsOwnerConfirmation !== undefined) {
      errors.push("instance.needsOwnerConfirmation ist veraltet; ownerConfirmation verwenden.");
    }

    if (!seoUtils.isPlainObject(instance.ownerConfirmation)) {
      errors.push("instance.ownerConfirmation ist für Produktion erforderlich.");
    } else {
      const openConfirmations = Object.entries(instance.ownerConfirmation)
        .filter(([, confirmed]) => confirmed !== true)
        .map(([field]) => field);

      if (openConfirmations.length > 0) {
        errors.push(`Offene Betreiberbestätigungen: ${openConfirmations.join(", ")}`);
      }
    }

    if (instance.productionReady === false) errors.push("instance.productionReady ist false.");
    if (!["approved", "production"].includes(String(instance.imageStatus || "").toLowerCase())) {
      errors.push("instance.imageStatus muss für Produktion approved oder production sein.");
    }
  }

  if (!seoUtils.isPlainObject(legal)) {
    errors.push("legal ist für Produktion erforderlich.");
  } else {
    ["company", "owner", "privacyUrl", "imprintUrl"].forEach((field) => {
      const value = seoUtils.resolveValue(legal, field, "");
      if (!seoUtils.isNonEmptyString(value) || value.startsWith("#")) {
        errors.push(`legal.${field} muss vor Produktion vollständig hinterlegt sein.`);
      }
    });
  }

  return errors;
}

function metaName(name, content) {
  return content ? `  <meta name="${escapeHtml(name)}" content="${escapeHtml(content)}">` : "";
}

function metaProperty(property, content) {
  return content ? `  <meta property="${escapeHtml(property)}" content="${escapeHtml(content)}">` : "";
}

function linkTag(rel, href, extraAttributes = "") {
  if (!href) return "";
  const extra = extraAttributes ? ` ${extraAttributes}` : "";
  return `  <link rel="${escapeHtml(rel)}" href="${escapeHtml(href)}"${extra}>`;
}

function createSeoBlock(model) {
  const lines = [
    "<!-- SEO:GENERATED:START -->",
    `  <title>${escapeHtml(model.title)}</title>`,
    metaName("description", model.description),
    metaName("keywords", model.keywords),
    metaName("author", model.author),
    metaName("robots", model.robots),
    linkTag("canonical", model.canonicalUrl),
    metaName("theme-color", model.themeColor),
    linkTag("icon", model.favicon),
    linkTag("apple-touch-icon", model.favicon),
    ...model.alternates.map((alternate) =>
      linkTag("alternate", alternate.href, `hreflang="${escapeHtml(alternate.language)}" data-seo-alternate="true"`)
    ),
    metaProperty("og:type", model.openGraph.type),
    metaProperty("og:site_name", model.openGraph.siteName),
    metaProperty("og:locale", model.openGraph.locale),
    metaProperty("og:url", model.openGraph.url),
    metaProperty("og:title", model.openGraph.title),
    metaProperty("og:description", model.openGraph.description),
    metaProperty("og:image", model.openGraph.image),
    metaProperty("og:image:alt", model.openGraph.imageAlt),
    metaName("twitter:card", model.twitter.card),
    metaName("twitter:title", model.twitter.title),
    metaName("twitter:description", model.twitter.description),
    metaName("twitter:image", model.twitter.image),
    metaName("twitter:image:alt", model.twitter.imageAlt),
    "  <!-- JSON-LD:GENERATED:START -->",
    '  <script type="application/ld+json" data-restaurant-schema="true">',
    JSON.stringify(model.schema, null, 2)
      .replaceAll("<", "\\u003c")
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n"),
    "  </script>",
    "  <!-- JSON-LD:GENERATED:END -->",
    "  <!-- SEO:GENERATED:END -->"
  ];

  return lines.filter(Boolean).join("\n");
}

function replaceToken(template, token, value) {
  const marker = `{{${token}}}`;
  const count = template.split(marker).length - 1;
  if (count !== 1) fail(`Template-Marker ${marker} muss genau einmal vorhanden sein.`);
  return template.replace(marker, value);
}

function validateTemplate(template) {
  TEMPLATE_TOKENS.forEach((token) => {
    const marker = `{{${token}}}`;
    if (template.split(marker).length - 1 !== 1) {
      fail(`Template-Marker ${marker} muss genau einmal vorhanden sein.`);
    }
  });

  if (/Bellavista|Bistrik/i.test(template)) {
    fail("Die zentrale HTML-Vorlage darf keine Instanznamen enthalten.");
  }
}

function createPresentationNotice(config, mode) {
  if (mode === "production" || config?.instance?.presentationMode !== "pitch") {
    return "";
  }

  return [
    '  <aside class="presentation-notice" role="note" aria-label="Hinweis zum Website-Entwurf">',
    "    <strong>Unverbindlicher Website-Entwurf</strong>",
    "    <span>Keine offizielle Restaurant-Website. Inhalte und Öffnungszeiten müssen vom Betreiber bestätigt werden.</span>",
    "  </aside>"
  ].join("\n");
}

function renderHtml(template, entry, config, model, resourcePaths, mode) {
  const notice = [
    "GENERATED FILE",
    "Do not edit manually.",
    "Source: templates/restaurant.html",
    `Instance: ${entry.id}`,
    `Mode: ${mode}`
  ].join("\n  ");
  const values = {
    GENERATED_NOTICE: notice,
    LANGUAGE: escapeHtml(model.language),
    SEO_BLOCK: createSeoBlock(model),
    PRESENTATION_NOTICE: createPresentationNotice(config, mode),
    STYLE_PATH: resourcePaths.style,
    SEO_UTILS_PATH: resourcePaths.seoUtils,
    CONFIG_PATH: resourcePaths.config,
    SCRIPT_PATH: resourcePaths.script
  };

  return TEMPLATE_TOKENS.reduce(
    (html, token) => replaceToken(html, token, values[token]),
    template
  );
}

function createRobots(model, mode) {
  const noIndex = mode === "staging" || /noindex/i.test(model.robots);
  const lines = ["User-agent: *", noIndex ? "Disallow: /" : "Allow: /"];

  if (!noIndex && seoUtils.isPublicProductionUrl(model.canonicalUrl)) {
    lines.push("", `Sitemap: ${new URL("./sitemap.xml", model.canonicalUrl).href}`);
  }

  return `${lines.join("\n")}\n`;
}

function createSitemap(model) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  ];

  if (model.canonicalUrl) {
    lines.push(
      "  <url>",
      `    <loc>${escapeXml(model.canonicalUrl)}</loc>`,
      `    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>`,
      "  </url>"
    );
  }

  lines.push("</urlset>", "");
  return lines.join("\n");
}

function writeIfChanged(filePath, content) {
  const normalized = content.endsWith("\n") ? content : `${content}\n`;
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  if (current === normalized) return false;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, normalized, "utf8");
  return true;
}

function writeBufferIfChanged(filePath, content) {
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath) : null;
  if (current && current.equals(content)) return false;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  return true;
}

function syncDirectory(sourcePath, destinationPath) {
  fs.mkdirSync(destinationPath, { recursive: true });
  const sourceNames = new Set(fs.readdirSync(sourcePath));

  fs.readdirSync(destinationPath).forEach((name) => {
    if (!sourceNames.has(name)) fs.rmSync(path.join(destinationPath, name), { recursive: true, force: true });
  });

  fs.readdirSync(sourcePath, { withFileTypes: true }).forEach((entry) => {
    const source = path.join(sourcePath, entry.name);
    const destination = path.join(destinationPath, entry.name);
    if (entry.isDirectory()) syncDirectory(source, destination);
    else writeBufferIfChanged(destination, fs.readFileSync(source));
  });
}

function createOutputConfig(source, mode) {
  if (mode === "demo") return source;
  const robots = mode === "production" ? "index,follow" : "noindex,nofollow";
  return `${source.trimEnd()}\n\n// Deployment-Modus wird vom Generator erzwungen.\nwindow.restaurantConfig.seo = window.restaurantConfig.seo || {};\nwindow.restaurantConfig.seo.robots = ${JSON.stringify(robots)};\n`;
}

function buildInstance(entry, template, options = {}) {
  const configPath = resolveProjectPath(entry.config, `${entry.id}.config`);
  const outputPath = resolveProjectPath(entry.output, `${entry.id}.output`);
  const mode = options.production === true ? "production" : entry.deploymentMode;
  const { config, source } = loadConfig(configPath);
  const effectiveConfig = applyDeploymentMode(config, mode);
  const model = seoUtils.createSeoModel(effectiveConfig);
  const validation = validateConfig(effectiveConfig, model);

  if (!validation.valid) {
    fail(`${entry.id}: Config-Validierung fehlgeschlagen:\n${validation.errors.map((error) => `- ${error}`).join("\n")}`);
  }

  validation.warnings.forEach((warning) => console.warn(`[${entry.id}] Config-Warnung: ${warning}`));
  const domainIssues = seoUtils.getConfiguredDomainIssues(effectiveConfig);
  domainIssues.forEach((issue) => {
    console.warn(`[${entry.id}] Domain-Warnung: ${issue.message}`);
  });

  if (mode === "staging" && domainIssues.length > 0) {
    fail(`${entry.id}: Staging-Prüfung fehlgeschlagen:\n${domainIssues.map((issue) => `- ${issue.message}`).join("\n")}`);
  }

  if (mode === "production") {
    const productionErrors = validateProduction(effectiveConfig);
    if (productionErrors.length > 0) {
      fail(`${entry.id}: Produktionsprüfung fehlgeschlagen:\n${productionErrors.map((error) => `- ${error}`).join("\n")}`);
    }
  }

  const html = renderHtml(template, entry, effectiveConfig, model, {
    style: "../shared/style.css",
    seoUtils: "../shared/seo-utils.js",
    config: "config.js",
    script: "../shared/script.js"
  }, mode);

  writeIfChanged(path.join(outputPath, "index.html"), html);
  writeIfChanged(path.join(outputPath, "config.js"), createOutputConfig(source, mode));
  writeIfChanged(path.join(outputPath, "robots.txt"), createRobots(model, mode));
  writeIfChanged(path.join(outputPath, "sitemap.xml"), createSitemap(model));

  const destinationAssets = path.join(outputPath, "assets");
  if (entry.assets) syncDirectory(resolveProjectPath(entry.assets, `${entry.id}.assets`), destinationAssets);
  else fs.rmSync(destinationAssets, { recursive: true, force: true });

  if (entry.rootDemo) {
    const rootHtml = renderHtml(template, entry, effectiveConfig, model, {
      style: "style.css",
      seoUtils: "seo-utils.js",
      config: entry.config.replaceAll("\\", "/"),
      script: "script.js"
    }, mode);
    writeIfChanged(path.join(ROOT, "index.html"), rootHtml);
    writeIfChanged(path.join(ROOT, "robots.txt"), createRobots(model, mode));
    writeIfChanged(path.join(ROOT, "sitemap.xml"), createSitemap(model));
  }

  return { id: entry.id, mode, warnings: validation.warnings.length };
}

function cleanDist() {
  const resolvedDist = path.resolve(DIST);
  if (!isPathInside(ROOT, resolvedDist)) fail("Unsicherer dist-Pfad.");
  fs.rmSync(resolvedDist, { recursive: true, force: true });
}

function parseArguments(argumentsList) {
  const options = { instanceId: "", production: false, clean: false };

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--production") options.production = true;
    else if (argument === "--clean") options.clean = true;
    else if (argument === "--instance") {
      const id = argumentsList[index + 1];
      if (!id || id.startsWith("--")) fail("--instance benötigt eine Instanz-ID.");
      options.instanceId = id;
      index += 1;
    } else fail(`Unbekannte Option: ${argument}`);
  }

  return options;
}

function runBuild(options = {}) {
  const manifest = validateManifest(options.manifest || loadManifest());
  const template = options.template || fs.readFileSync(TEMPLATE_PATH, "utf8");
  validateTemplate(template);

  if (options.clean) cleanDist();

  SHARED_FILES.forEach((fileName) => {
    writeIfChanged(path.join(DIST, "shared", fileName), fs.readFileSync(path.join(ROOT, fileName), "utf8"));
  });

  let entries = manifest;
  if (options.instanceId) {
    const match = manifest.find((entry) => entry.id === options.instanceId);
    if (!match) fail(`Unbekannte Instanz: ${options.instanceId}`);
    entries = [match];
  }

  const enabledEntries = entries.filter((entry) => {
    if (!entry.enabled) console.warn(`[${entry.id}] Deaktivierte Instanz wird übersprungen.`);
    return entry.enabled;
  });
  const results = [];
  const errors = [];

  enabledEntries.forEach((entry) => {
    try {
      results.push(buildInstance(entry, template, options));
      console.log(`[${entry.id}] Build erfolgreich.`);
    } catch (error) {
      errors.push(error.message);
      console.error(error.message);
    }
  });

  if (errors.length > 0) fail(`${errors.length} Instanz-Build(s) fehlgeschlagen.`);
  if (results.length === 0) console.log("Keine aktive Instanz ausgewählt.");
  return results;
}

function main() {
  try {
    const options = parseArguments(process.argv.slice(2));
    const results = runBuild(options);
    console.log(`Multi-Instance-Build abgeschlossen: ${results.length} Instanz(en).`);
  } catch (error) {
    console.error(`Multi-Instance-Build abgebrochen: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  buildInstance,
  createPresentationNotice,
  createRobots,
  createSeoBlock,
  createSitemap,
  parseArguments,
  runBuild,
  validateConfig,
  validateManifest,
  validateProduction,
  validateTemplate
};
