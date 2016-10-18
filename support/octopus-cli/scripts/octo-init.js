#!/usr/bin/env node
'use strict';
const program = require('commander'),
  log = require('../lib/logger')(),
  shelljs = require('shelljs'),
  path = require('path'),
  assert = require('../lib/asserts');

program._name = 'octo init';
program.option('-n, --no-hook', 'Do not add git pre-push hook');
program.parse(process.argv);

log.exec('init', () => {
  assert.assertGitRepo(process.cwd(), log);
  addDefaultOctopusJsonIfMissing();
  backupExistingGitHookIfPresent();
  if (program.hook !== false) {
    addDefaultGitHook();
  }
});

function addDefaultOctopusJsonIfMissing() {
  log.info('Adding default configuration file (octopus.json)');
  if (shelljs.test('-f', 'octopus.json')) {
    log.warn('  Existing configuration file exists (octopus.json) - skipping');
  } else {
    shelljs.cp(path.resolve(__dirname, '../files/octopus.json'), 'octopus.json');
    log.info('Done.');
  }
}

function backupExistingGitHookIfPresent() {
  if (shelljs.test('-f', '.git/hooks/pre-push')) {
    log.warn('  Existing git hook (.git/hooks/pre-push) found - backed-up.');
    shelljs.mv('.git/hooks/pre-push', `.git/hooks/pre-push.backup-${Date.now()}`)
  }
}

function addDefaultGitHook() {
  log.info('Adding default git hook (.git/hooks/pre-push)');
  backupExistingGitHookIfPresent();
  shelljs.mkdir('-p', '.git/hooks');
  shelljs.cp(path.resolve(__dirname, '../files/pre-push'), '.git/hooks/pre-push');
  log.info('Done.');
}