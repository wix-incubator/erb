#!/usr/bin/env node
'use strict';
const program = require('commander'),
  log = require('../lib/logger')(),
  shelljs = require('shelljs'),
  path = require('path'),
  assert = require('../lib/asserts'),
  octopus = require('../lib/octopus'),
  help = require('../lib/help'),
  findProjectRoot = require('../lib/project-root'),
  config = require('../lib/config');

program._name = 'octo exec';

program
  .option('-a, --all', 'execute for all modules', false);

const projectRoot = findProjectRoot(process.cwd());
assert.assertGitRepo(projectRoot, log);

program.parse(process.argv);

if (program.args.length === 0) {
  program.help(help);
} else {
  forCommand(`octo exec ${program.args.join(' ')}`, (octo, opts) => {
    const forAll = opts.all ? true : false;
    const modules = octo.modules.filter(module => forAll ? module : module.needsRebuild());
    const count = modules.length;

    if (count === 0) {
      log.warn(forAll ? 'no modules found' : 'no modules with changes found');
    } else {
      modules.forEach((module, i) => module.inDir(() => {
        log.for(`${module.npm.name} (${module.relativePath}) (${i + 1}/${count})`, () => {
          const res = shelljs.exec(opts.args.join(), {});
          if (res === null) {
            process.exit(1);
          }
        });
      }));
    }
  })(program);
}

function forCommand(name, fn) {
  return (opts) => {
    log.exec(name, () => {
      const conf = config(projectRoot);
      fn(octopus({cwd: projectRoot, excludes: conf.exclude}), opts);
      process.exit(0);
    });
  };
}