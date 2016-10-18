#!/usr/bin/env node
'use strict';
const program = require('commander'),
  log = require('../lib/logger')(),
  shelljs = require('shelljs'),
  path = require('path'),
  assert = require('../lib/asserts'),
  octopus = require('../lib/octopus'),
  findProjectRoot = require('../lib/project-root'),
  config = require('../lib/config');

program._name = 'octo run';

program
  .option('-a, --all', 'run for all modules')
  .option('-b, --build', 'mark modules as built')
  .option('-v, --verbose', 'show verbose output')
  .command('<scripts> [otherScripts...]');

const projectRoot = findProjectRoot(process.cwd());
assert.assertGitRepo(projectRoot, log);

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
} else {
  forCommand(`octo run ${program.args.join(' ')}`, (octo, opts) => {
    const forAll = opts.all ? true : false;
    const shouldBuild = opts.build;
    const silent = opts.verbose ? false : true;
    const modules = octo.modules.filter(module => forAll === true ? module : module.needsRebuild());
    const count = modules.length;

    if (count === 0) {
      log.warn(forAll ? 'no modules found' : 'no modules with changes found');
    } else {

      modules.forEach((module, i) => module.inDir(() => {
        log.for(`${module.npm.name} (${module.relativePath}) (${i + 1}/${count})`, () => {
          const scripts = process.argv.slice(2).filter(command => !command.startsWith('-'));
          const effectiveCommands = scripts.map(el => {
            let cmd = `npm run ${el}`;
            if (el.trim() === 'install') {
              if (module.links().length > 0) {
                cmd = `npm link '${module.links().join('\' \'')}' && npm install`;
              } else {
                cmd = 'npm install';
              }
            }
            console.log(cmd);
            return {
              name: el,
              cmd: cmd
            }
          });

          effectiveCommands.forEach(el => {
            log.for(` ${el.name} (${el.cmd})`, () => {
              const res = shelljs.exec(el.cmd, {silent});
                if (res === null) {
                  process.exit(1);
                }
                if (res.code) {
                  log.plain(res.stdout);
                  log.error(res.stderr);
                  process.exit(1);
                }

              if (shouldBuild === true) {
                module.markBuilt();
              }
            });
          });
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



