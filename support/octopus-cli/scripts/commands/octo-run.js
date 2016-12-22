#!/usr/bin/env node
const log = require('../../lib/logger')(),
  forCommand = require('../../lib/commands').forCommand,
  engines = require('../../lib/engines');

exports.command = 'run';
exports.desc = 'runs npm scripts for modules with changes';
exports.builder = yargs => {
  return yargs
    .usage('\nUsage: octo run [options] <script> [otherScripts...]')
    .demand(1)
    .option('a', {
      alias: 'all',
      describe: 'execute for all modules regardless of current build status',
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
    });
};

exports.handler = forCommand(opts => `octo run ${opts._.slice(1).join(' ')}`, (octo, config, opts) => {
  const engine = engines(config);
  const forAll = opts.all;
  const noBuild = opts.noBuild;
  const verbose = opts.verbose;
  const scripts = opts._.slice(1);

  if (forAll) {
    log.warn('marking modules with changes as unbuilt');
    octo.modules.forEach(module => module.markUnbuilt());
  }
  
  const modules = octo.modules.filter(module => forAll === true ? module : module.needsRebuild());
  //TODO: so would continue after failure. Test this.
  modules.forEach(module => module.markUnbuilt());
  const count = modules.length;

  if (count === 0) {
    log.warn(forAll ? 'no modules found' : 'no modules with changes found');
  } else {
    modules.forEach((module, i) => module.inDir(() => {
      log.for(`${module.npm.name} (${module.relativePath}) (${i + 1}/${count})`, () => {
        const effectiveCommands = scripts.map(script => {
          return { name: script, cmd: engine.run(script)}
        });

        effectiveCommands.forEach(el => {
          log.for(` ${el.name} (${el.cmd})`, () => {
            module.exec(el.cmd, verbose);
          });
        });
        if (!noBuild) {
          module.markBuilt();
        }
      });
    }));
  }
});
