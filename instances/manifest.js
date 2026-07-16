"use strict";

module.exports = [
  {
    id: "bellavista",
    config: "instances/bellavista/config.js",
    assets: "instances/bellavista/assets",
    output: "dist/bellavista",
    enabled: true,
    deploymentMode: "demo",
    rootDemo: true
  },
  {
    id: "bistrik",
    config: "instances/bistrik/config.js",
    assets: "instances/bistrik/assets",
    output: "dist/bistrik",
    enabled: true,
    deploymentMode: "demo",
    rootDemo: false
  }
];
