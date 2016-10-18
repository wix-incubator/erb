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

program._name = 'octo modules';

program.command('list')
  .description('list all managed modules')
  .action(forCommand('modules list', octo => {
    handleCommand(octo.modules, () => {
    }, 'no modules found', module => module.npm.version);
  }));

program.command('changed')
  .description('list all modules with changes')
  .action(forCommand('modules changed', octo => {
    const modules = octo.modules.filter(module => module.needsRebuild());
    handleCommand(modules, () => {
    }, 'no changed modules', module => module.hasChanges() ? 'changed' : 'dependency changed');
  }));

program.command('build')
  .description('mark all modules as built')
  .action(forCommand('modules build', octo => {
    const modules = octo.modules.filter(module => module.needsRebuild());
    handleCommand(modules, module => module.markBuilt(), 'no changed modules');
  }));

program.command('unbuild')
  .description('mark all modules as unbuilt')
  .action(forCommand('modules unbuild', octo => {
    const modules = octo.modules.filter(module => !module.needsRebuild());
    handleCommand(modules, module => module.markUnbuilt(), 'no modules without changes');
  }));

program.command('sync')
  .description('sync module versions (-s to persist actions)')
  .option('-s, --save', 'persist actions')
  .action(forCommand('modules sync', (octo, opts) => {
    const modules = octo.modules;
    const depsAndVersions = getModulesAndVersions(modules);
    const res = modules.map(module => {
      const diff = module.merge({
        dependencies: depsAndVersions,
        peerDependencies: depsAndVersions,
        devDependencies: depsAndVersions
      }, opts.save);

      if (diff) {
        return {module, diff};
      }
    }).filter(module => module);

    if (res.length === 0) {
      log.warn('all modules are in sync');
    } else {
      res.forEach((pkg, i, all) => {
        const module = pkg.module;
        const diff = pkg.diff;
        log.for(`${module.npm.name} (${module.relativePath}) (${i + 1}/${all.length})`, () => {
          ['dependencies', 'devDependencies', 'peerDependencies'].forEach(type => {
            if (diff[type]) {
              const changes = diff[type];
              Object.keys(changes).forEach(el => {
                log.info(`  ${el}: ${changes[el][0]} -> ${changes[el][1]}`);
              });
            }
          });
        });
      });
    }
  }));

const projectRoot = findProjectRoot(process.cwd());
assert.assertGitRepo(projectRoot, log);

program.parse(process.argv);
program.help();

function forCommand(name, fn) {
  return (opts) => {
    log.exec(name, () => {
      const conf = config(projectRoot);
      fn(octopus({cwd: projectRoot, excludes: conf.exclude}), opts);
      process.exit(0);
    });
  };
}

function handleCommand(modules, forEachFn, nothingMsg, maybeMsgFn) {
  const count = modules.length;
  if (count === 0) {
    log.warn(nothingMsg);
  } else {
    modules.forEach((module, i) => {
      const msg = maybeMsgFn ? `(${maybeMsgFn(module)}) ` : '';
      log.for(`${module.npm.name} (${module.relativePath}) ${msg}(${i + 1}/${count})`, () => {
        forEachFn(module);
      });
    });
  }
}
//TODO: strip semver or compare with semver
function getModulesAndVersions(modules) {
  return modules.reduce((prev, curr) => {
    prev[curr.npm.name] = `~${curr.npm.version}`;
    return prev;
  }, {});
}
