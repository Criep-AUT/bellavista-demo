#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const seoUtils = require("../seo-utils.js");

const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "config.js");
const INDEX_PATH = path.join(ROOT, "index.html");
const ROBOTS_PATH = path.join(ROOT, "robots.txt");
const SITEMAP_PATH = path.join(ROOT, "sitemap.xml");
const SEO_START = "<!-- SEO:GENERATED:START -->";
const SEO_END = "<!-- SEO:GENERATED:END -->";
const JSON_LD_START = "<!-- JSON-LD:GENERATED:START -->";
const JSON_LD_END = "<!-- JSON-LD:GENERATED:END -->";

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

function loadConfig() {
  const source = fs.readFileSync(CONFIG_PATH, "utf8");
  const context = vm.createContext({ window: {} });

  new vm.Script(source, { filename: CONFIG_PATH }).runInContext(context, {
    timeout: 1000
  });

  if (!seoUtils.isPlainObject(context.window.restaurantConfig)) {
    fail("config.js stellt keine gültige window.restaurantConfig bereit.");
  }

  return context.window.restaurantConfig;
}

function validateCriticalConfig(config, model) {
  const restaurantName = seoUtils.resolveValue(
    config.identity,
    "fullName",
    seoUtils.resolveValue(config.restaurant, "fullName", "")
  );

  if (!seoUtils.isNonEmptyString(restaurantName)) {
    fail("Kritischer Konfigurationsfehler: identity.fullName oder restaurant.fullName fehlt.");
  }

  if (!seoUtils.isNonEmptyString(model.title)) {
    fail("Kritischer Konfigurationsfehler: Es kann kein Seitentitel erzeugt werden.");
  }

  if (!seoUtils.isNonEmptyString(model.description)) {
    fail("Kritischer Konfigurationsfehler: Es kann keine Meta Description erzeugt werden.");
  }

  let canonical;

  try {
    canonical = new URL(model.canonicalUrl);
  } catch {
    fail("Kritischer Konfigurationsfehler: Es kann keine absolute Canonical URL erzeugt werden.");
  }

  if (!["http:", "https:"].includes(canonical.protocol)) {
    fail("Kritischer Konfigurationsfehler: Die Canonical URL muss HTTP oder HTTPS verwenden.");
  }

  if (!seoUtils.isPlainObject(model.schema) || model.schema["@type"] !== "Restaurant") {
    fail("Kritischer Konfigurationsfehler: Das Restaurant-Schema konnte nicht erzeugt werden.");
  }
}

function metaName(name, content) {
  return content
    ? `  <meta name="${escapeHtml(name)}" content="${escapeHtml(content)}">`
    : "";
}

function metaProperty(property, content) {
  return content
    ? `  <meta property="${escapeHtml(property)}" content="${escapeHtml(content)}">`
    : "";
}

function linkTag(rel, href, extraAttributes = "") {
  if (!href) {
    return "";
  }

  const extra = extraAttributes ? ` ${extraAttributes}` : "";
  return `  <link rel="${escapeHtml(rel)}" href="${escapeHtml(href)}"${extra}>`;
}

function createGeneratedSeoBlock(model) {
  const lines = [
    `  ${SEO_START}`,
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
      linkTag(
        "alternate",
        alternate.href,
        `hreflang="${escapeHtml(alternate.language)}" data-seo-alternate="true"`
      )
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
    `  ${JSON_LD_START}`,
    '  <script type="application/ld+json" data-restaurant-schema="true">',
    JSON.stringify(model.schema, null, 2)
      .replaceAll("<", "\\u003c")
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n"),
    "  </script>",
    `  ${JSON_LD_END}`,
    `  ${SEO_END}`
  ];

  return lines.filter(Boolean).join("\n");
}

function replaceGeneratedBlock(html, block) {
  const startCount = html.split(SEO_START).length - 1;
  const endCount = html.split(SEO_END).length - 1;

  if (startCount !== 1 || endCount !== 1) {
    fail("index.html muss genau einen vollständigen SEO:GENERATED-Block enthalten.");
  }

  const startIndex = html.indexOf(SEO_START);
  const lineStart = html.lastIndexOf("\n", startIndex) + 1;
  const endIndex = html.indexOf(SEO_END, startIndex) + SEO_END.length;

  return `${html.slice(0, lineStart)}${block}${html.slice(endIndex)}`;
}

function writeIfChanged(filePath, content) {
  const normalizedContent = content.endsWith("\n") ? content : `${content}\n`;
  const currentContent = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf8")
    : "";

  if (currentContent === normalizedContent) {
    return false;
  }

  fs.writeFileSync(filePath, normalizedContent, "utf8");
  return true;
}

function createRobots(model) {
  const lines = ["User-agent: *", "Allow: /"];

  if (seoUtils.isPublicProductionUrl(model.canonicalUrl)) {
    lines.push("", `Sitemap: ${new URL("./sitemap.xml", model.canonicalUrl).href}`);
  }

  return `${lines.join("\n")}\n`;
}

function createSitemap(model) {
  const lastModified = new Date().toISOString().slice(0, 10);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "  <url>",
    `    <loc>${escapeXml(model.canonicalUrl)}</loc>`,
    `    <lastmod>${lastModified}</lastmod>`,
    "  </url>",
    "</urlset>",
    ""
  ].join("\n");
}

function run() {
  const argumentsList = process.argv.slice(2);
  const productionMode = argumentsList.includes("--production");
  const unknownArguments = argumentsList.filter((argument) => argument !== "--production");

  if (unknownArguments.length > 0) {
    fail(`Unbekannte Option: ${unknownArguments.join(", ")}`);
  }

  const config = loadConfig();
  const model = seoUtils.createSeoModel(config);
  validateCriticalConfig(config, model);

  const domainIssues = seoUtils.getConfiguredDomainIssues(config);

  if (productionMode && domainIssues.length > 0) {
    fail(
      `Produktionsprüfung fehlgeschlagen:\n${domainIssues
        .map((issue) => `- ${issue.message}`)
        .join("\n")}`
    );
  }

  domainIssues.forEach((issue) => {
    console.warn(`Domain-Warnung: ${issue.message}`);
  });

  const html = fs.readFileSync(INDEX_PATH, "utf8");
  const generatedBlock = createGeneratedSeoBlock(model);
  const nextHtml = replaceGeneratedBlock(html, generatedBlock);
  const changedFiles = [];

  if (writeIfChanged(INDEX_PATH, nextHtml)) changedFiles.push("index.html");
  if (writeIfChanged(ROBOTS_PATH, createRobots(model))) changedFiles.push("robots.txt");
  if (writeIfChanged(SITEMAP_PATH, createSitemap(model))) changedFiles.push("sitemap.xml");

  console.log(
    changedFiles.length > 0
      ? `SEO-Dateien aktualisiert: ${changedFiles.join(", ")}`
      : "SEO-Dateien sind bereits aktuell."
  );
}

try {
  run();
} catch (error) {
  console.error(`SEO-Generierung abgebrochen: ${error.message}`);
  process.exitCode = 1;
}
