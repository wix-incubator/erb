#!/usr/bin/env node
'use strict';
const log = require('../../lib/logger')(),
  forCommand = require('../../lib/commands').forCommand;

exports.command = 'run';
exports.desc = 'runs npm scripts for modules with changes';
exports.builder = yargs => {
  return yargs
    .usage('\nUsage: octo run [options] <script> [otherScripts...]')
    .demand(1)
    .option('a', {
      alias: 'all',
      describe: 'execute for all modules',
      type: 'boolean'
    })
    .option('b', {
      alias: 'build',
      describe: 'mark modules as built',
      type: 'boolean'
    });
};

exports.handler = forCommand(opts => `octo run ${opts._.slice(1).join(' ')}`, (octo, config, opts) => {
  const forAll = opts.all;
  const shouldBuild = opts.build;
  const verbose = opts.verbose;
  const scripts = opts._.slice(1);
  const modules = octo.modules.filter(module => forAll === true ? module : module.needsRebuild());
  const count = modules.length;

  if (count === 0) {
    log.warn(forAll ? 'no modules found' : 'no modules with changes found');
  } else {
    modules.forEach((module, i) => module.inDir(() => {
      log.for(`${module.npm.name} (${module.relativePath}) (${i + 1}/${count})`, () => {
        const effectiveCommands = scripts.map(script => {
          let cmd = `npm run ${script}`;
          //TODO: augment other commands
          if (script === 'install') {
            if (module.links().length > 0) {
              cmd = `npm link '${module.links().join('\' \'')}' && npm --cache-min 3600 install`;
            } else {
              cmd = 'npm --cache-min 3600 install';
            }
          }
          return {
            name: script,
            cmd: cmd
          }
        });

        effectiveCommands.forEach(el => {
          log.for(` ${el.name} (${el.cmd})`, () => {
            module.exec(el.cmd, verbose);
            if (shouldBuild === true) {
              module.markBuilt();
            }
          });
        });
      });
    }));
  }
});