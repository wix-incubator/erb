#!/usr/bin/env node
const log = require('../../lib/logger')(),
  shelljs = require('shelljs'),
  _ = require('lodash'),
  forCommand = require('../../lib/commands').forCommand;

exports.command = 'modules';
exports.desc = 'manage modules - list, sync versions, show changed...';
exports.builder = yargs => {
  return yargs
    .usage('\nUsage: octo modules [options] <command>')
    .command('list', 'list all managed modules', yargs => yargs, listHander())
    .command('changed', 'list all modules with changes', yargs => yargs, changedHander())
    .command('build', 'mark all modules as built', yargs => yargs, buildHander())
    .command('unbuild', 'mark all modules as unbuilt', yargs => yargs, unbuildHander())
    .command('where', 'show where module is used', yargs => yargs.demand(1), showWhereHandler())
    .command('sync', 'sync module versions', yargs => {
      return yargs.option('s', {
        alias: 'save',
        describe: 'persist actions',
        type: 'boolean'
      })

    }, syncHander())
    .demand(1);
};

function showWhereHandler() {
  return forCommand('octo modules where', (octo, config, opts) => {
    const modules = octo.modules;
    const moduleToFind = opts._.slice(2)[0];
    
    if (!modules.find(el => el.npm.name === moduleToFind)) {
      log.warn(`module '${moduleToFind}' not found`);
      process.exit(1);
    }
    
    const dependees = modules.filter(module => module.npm.dependencies[moduleToFind]);
    
    if (dependees.length === 0) {
      log.warn(`module '${moduleToFind}' is not used in other modules`);
    } else {
      dependees.forEach(dep => {
        log.info(`  ${dep.npm.name} (${dep.npm.dependencies[moduleToFind]})`);
      });
    }
  });
}


function listHander() {
  return forCommand('octo modules list', octo => {
    handleCommand(octo.modules, () => {
    }, 'no modules found', module => module.npm.version);
  });
}

function changedHander() {
  return forCommand('octo modules changed', octo => {
    const modules = octo.modules.filter(module => module.needsRebuild());
    handleCommand(modules, () => {
    }, 'no changed modules', module => module.hasChanges() ? 'changed' : 'dependency changed');
  });
}

function buildHander() {
  return forCommand('octo modules build', octo => {
    const modules = octo.modules.filter(module => module.needsRebuild());
    handleCommand(modules, module => module.markBuilt(), 'no changed modules');
  });
}

function unbuildHander() {
  return forCommand('octo modules unbuild', octo => {
    const modules = octo.modules.filter(module => !module.needsRebuild());
    handleCommand(modules, module => module.markUnbuilt(), 'no modules without changes');
  });
}

function syncHander() {
  return forCommand('octo modules sync', (octo, config, opts) => {
    const save = opts.save;
    const modules = octo.modules;
    const depsAndVersions = getModulesAndVersions(modules);
    const res = modules.map(module => {
      const diff = module.merge({
        dependencies: depsAndVersions,
        peerDependencies: depsAndVersions,
        devDependencies: depsAndVersions
      }, save);

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
  });
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
