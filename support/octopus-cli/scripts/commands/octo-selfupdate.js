#!/usr/bin/env node
const forCommand = require('../../lib/commands').forCommand,
  shelljs = require('shelljs');

exports.command = 'selfupdate';
exports.desc = 'npm install -g latest version of myself';
exports.builder = yargs => yargs.usage('\nUsage: octo selfupdate');

exports.handler = forCommand('octo selfupdate (npm install -g octopus-cli)', () => {
  shelljs.exec('npm install -g octopus-cli', {silent: false});
});
