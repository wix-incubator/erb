#!/usr/bin/env node
const log = require('../../lib/logger')(),
  forCommand = require('../../lib/commands').forCommand;

exports.command = 'exec';
exports.desc = 'execute arbitrary bash script for modules with changes';
exports.builder = yargs => {
  return yargs
    .usage('\nUsage: octo exec [options] \'<cmd>\'')
    .demand(1)
    .option('a', {
      alias: 'all',
      describe: 'execute for all modules',
      type: 'boolean'
    })
    .option('n', {
      alias: 'no-build',
      describe: 'do not mark modules as built',
      type: 'boolean'
    })
    .option('v', {
      alias: 'verbose',
      describe: 'verbose output',
      type: 'boolean'
    })
    .example('octo exec \'echo 1\'');
};

exports.handler = forCommand(opts => `octo exec '${opts._.slice(1).join()}'`, (octo, config, opts) => {
  const forAll = opts.all;
  const cmd = opts._.slice(1).join();
  const verbose = opts.verbose;
  const noBuild = opts.noBuild;

  const modules = octo.modules.filter(module => forAll ? module : module.needsRebuild());
  const count = modules.length;

  if (count === 0) {
    log.warn(forAll ? 'no modules found' : 'no modules with changes found');
  } else {
    modules.forEach((module, i) =>
      log.for(`${module.npm.name} (${module.relativePath}) (${i + 1}/${count})`, () => {
        module.exec(cmd, verbose);
        
        if (!noBuild) {
          module.markBuilt();
        }
        
      }));
  }
});
