#!/usr/bin/env node
'use strict';
const program = require('commander'),
  packageJson = require('../package.json'),
  help = require('../lib/help');

program
  .version(packageJson.version)
  .command('init', 'initialize octopus for repository')
  .command('modules', 'manage modules - list, sync versions, show changed...')
  .command('exec', 'execute arbitrary bash script for modules with changes')
  .command('run', 'runs npm scripts for modules with changes')
  .command('deps', 'perform operations on managed module dependencies');

if (isHelp(process.argv.slice(2))) {
  program._name = 'octo';
  program.help(help);
}

program.parse(process.argv);

function isHelp(args) {
  return (args.length === 0 || args.find(arg => arg === '--help' || arg === '-h'));
}