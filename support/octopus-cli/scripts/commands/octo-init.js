#!/usr/bin/env node
const log = require('../../lib/logger')(),
  shelljs = require('shelljs'),
  path = require('path'),
  assert = require('../../lib/asserts');

exports.command = 'init';
exports.desc = 'initialize octopus for repository';
exports.builder = yargs => {
  return yargs
    .usage('\nUsage: octo init [options]')
    .option('n', {
      alias: 'no-hook',
      describe: 'Do not add git pre-push hook',
      type: 'boolean'
    })
    .help();
};
exports.handler = argv => {
  log.exec('init', () => {
    assert.assertGitRepo(process.cwd(), log);
    addDefaultOctopusJsonIfMissing();
    backupExistingGitHookIfPresent();
    if (!argv.noHook) {
      addDefaultGitHook();
    }
  });
};

function addDefaultOctopusJsonIfMissing() {
  log.info('Adding default configuration file (octopus.json)');
  if (shelljs.test('-f', 'octopus.json')) {
    log.warn('  Existing configuration file exists (octopus.json) - skipping');
  } else {
    shelljs.cp(path.resolve(__dirname, '../../files/octopus.json'), 'octopus.json');
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
  shelljs.cp(path.resolve(__dirname, '../../files/pre-push'), '.git/hooks/pre-push');
  log.info('Done.');
}
