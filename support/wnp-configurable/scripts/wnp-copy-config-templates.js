#!/usr/bin/env node
'use strict';
const runMode = require('wix-run-mode'),
  shelljs = require('shelljs'),
  join = require('path').join,
  assert = require('assert');

if (runMode.isProduction()) {
  assert(process.env.APP_TEMPL_DIR, 'NODE_ENV=\'production\', but APP_TEMPL_DIR not set, cannot copy config templates.');
  const targetDir = join(process.env.APP_TEMPL_DIR, '');
  const srcDir = process.cwd() + '/templates';

  if (!shelljs.test('-d', srcDir)) {
    console.error(`wnp-copy-config-templates: NODE_ENV='${process.env.NODE_ENV}', but '${process.cwd()}/templates' does not exist - skipping...`);
  }

  if (shelljs.ls(srcDir).length === 0) {
    console.error(`wnp-copy-config-templates: NODE_ENV='${process.env.NODE_ENV}', but '${process.cwd()}/templates' is empty - skipping...`);
  }

  console.info(`wnp-copy-config-templates: NODE_ENV='${process.env.NODE_ENV}', copying configs from '${process.cwd()}/templates' to '${targetDir}'`);
  shelljs.mkdir('-p', targetDir);
  shelljs.cp('-R', srcDir + '/', targetDir + '/');
} else {
  console.info(`wnp-copy-config-templates: NODE_ENV='${process.env.NODE_ENV}', skipping...`);
}

