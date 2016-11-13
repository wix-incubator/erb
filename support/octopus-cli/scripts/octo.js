#!/usr/bin/env node
const packageJson = require('../package.json'),
  help = require('../lib/help');

require('yargs')
  .usage(help('Usage: octo <command> [options]'))
  .version('version', '', packageJson.version)
  .alias('V', 'version')
  .commandDir('commands')
  .demand(1)
  .example('octo run --build clean install test', 'run npm scripts for changed packages and mark modules as built')
  .example('octo deps sync --save', 'sync dependency versions of all modules with ones defined in octopus.json')
  .help('h')
  .alias('h', 'help')
  .option('v', {
    alias: 'verbose',
    describe: 'verbose output',
    type: 'boolean'
  })
  .global('a')
  .argv;
