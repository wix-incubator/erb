#!/usr/bin/env node
'use strict';
const shelljs = require('shelljs'),
  join = require('path').join,
  grunt = require('grunt');

require('colors');

if (!shelljs.test('-d', './support/octopus-cli')) {
  console.error('Octopus must be executed from within root of server-platform-js repo. Exiting...'.red);
  process.exit(1);
}

const nvmRcDefinedVersion = shelljs.cat('.nvmrc').stdout;
const nodeVersion = process.version.substring(1);

if (nvmRcDefinedVersion !== nodeVersion) {
  console.error(`Current node version does not match that defined in .nvmrc (node: ${nodeVersion}, .nvmrc: ${nvmRcDefinedVersion}). Run nvm use in server-platform-js root and run me again.`.red);
  process.exit(1);
}


grunt.cli({
  base: process.cwd(),
  stack: true,
  gruntfile: join(process.cwd(), '/support/octopus-cli/Gruntfile.js')
});

