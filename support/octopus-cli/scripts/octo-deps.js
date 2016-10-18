#!/usr/bin/env node
'use strict';
const program = require('commander'),
  log = require('../lib/logger')(),
  shelljs = require('shelljs'),
  path = require('path'),
  assert = require('../lib/asserts'),
  octopus = require('../lib/octopus'),
  config = require('../lib/config'),
  _ = require('lodash'),
  findProjectRoot = require('../lib/project-root');

program._name = 'octo deps';

program.command('extraneous')
  .description('show managed dependencies that are not used in modules')
  .action(forCommand('deps extraneous', (octo, config) => {
    const modules = octo.modules;
    if (modules.length === 0) {
      log.warn('no modules found');
    } else {
      const platformDeps = getModulesAndVersions(modules);
      extraneous(modules, Object.assign({}, config.dependencies, config.devDependencies), platformDeps, ['dependencies', 'devDependencies']);
      extraneous(modules, Object.assign({}, config.peerDependencies), platformDeps, ['peerDependencies']);
    }
  }));

program.command('unmanaged')
  .description('show unmanaged module dependencies')
  .action(forCommand('deps unmanaged', (octo, config) => {
    const modules = octo.modules;
    if (modules.length === 0) {
      log.warn('no modules found');
    } else {
      const platformDeps = getModulesAndVersions(modules);
      unmanaged(modules, Object.assign({}, config.dependencies, config.devDependencies), platformDeps, ['dependencies', 'devDependencies']);
      unmanaged(modules, Object.assign({}, config.peerDependencies), platformDeps, ['peerDependencies']);
    }
  }));

program.command('latest')
  .description('show latest versions for managed dependencies')
  .action(forCommand('deps latest', (octo, config) => {
    const modules = octo.modules;
    if (modules.length === 0) {
      log.warn('no modules found');
    } else {
      latest(Object.assign({}, config.dependencies, config.devDependencies), 'dependencies, devDependencies');
      latest(Object.assign({}, config.peerDependencies), 'peerDependencies');
    }
  }));

program.command('sync')
  .description('sync module versions with managed dependency versions')
  .option('-s, --save', 'persist actions')
  .action(forCommand('deps sync', (octo, config, opts) => {
    const modules = octo.modules;
    const depsAndVersions = getModulesAndVersions(modules);
    const count = modules.length;

    if (count === 0) {
      log.warn('no modules found');
    } else {
      let notFound = true;
      modules.forEach((module, i) => {
        const diff = module.merge({
          dependencies: config.dependencies || {},
          devDependencies: config.dependencies || {},
          peerDependencies: config.peerDependencies || {}
        }, opts.save);
        if (diff) {
            console.log(diff);
          log.for(`${module.npm.name} (${module.relativePath}) (${i + 1}/${count})`, () => {
          Object.keys(diff).forEach(type => {
                const changedDeps = diff[type];
                Object.keys(changedDeps).forEach(dep => {
                  if (!depsAndVersions[dep]) {
                    log.info(`${dep} (${type}) (${changedDeps[dep][0]} -> ${changedDeps[dep][1]})`);
                    notFound = false;
                  }
                });
              });
          });
        }
      });

    if (notFound === true) {
        log.warn('No un-synced dependencies found');
      }

    }
  }));

function latest(deps, type) {
  log.for(`Latest ${type}:`, () => {
    let hadUpdates = false;
    Object.keys(deps).forEach((depName) => {
      const currentVersion = deps[depName];
      const latestVersion = shelljs.exec(`npm show ${depName} version`, {silent: true}).stdout.replace('\n', '');
      if (currentVersion.indexOf(latestVersion) > -1) {
        log.info(`${depName} (${currentVersion} -> ${latestVersion})`);
      } else {
        hadUpdates = true;
        log.warn(`${depName} (${currentVersion} -> ${latestVersion})`);
      }
    });

    if (hadUpdates === false) {
      log.warn(`No updates for ${type} found`);
    }
  });
}


function extraneous(modules, deps, platformModules, depTypes) {
  const dependencies = _.cloneDeep(deps);
  const modulesDeps = {};
  modules.forEach(module => Object.assign.apply(null, [modulesDeps].concat(depTypes.map(type => module.packageJson[type]))));
  Object.keys(platformModules).forEach(name => delete modulesDeps[name]);
  Object.keys(modulesDeps).forEach(name => delete dependencies[name]);

  if (_.isEqual({}, dependencies)) {
    log.warn(`No extraneous ${depTypes.join(', ')} found`);
  } else {
    log.for(`Extraneous ${depTypes.join(', ')}: `, () => {
      Object.keys(dependencies).forEach(el => log.info(el));
    });
  }
}

function unmanaged(modules, deps, platformModules, depTypes) {
  const modulesDeps = {};
  modules.forEach(module => {
    depTypes.forEach(depType => {
      const moduleDeps = module.packageJson[depType] || {};
      Object.keys(moduleDeps).forEach(dep => {
        if (modulesDeps[dep]) {
          modulesDeps[dep].push(moduleDeps[dep]);
        } else {
          modulesDeps[dep] = [moduleDeps[dep]];
        }
      });
    });
  });
  Object.keys(platformModules).forEach(name => delete modulesDeps[name]);
  Object.keys(deps).forEach(name => delete modulesDeps[name]);

  if (_.isEqual({}, modulesDeps)) {
    log.warn(`No unmanaged ${depTypes.join(', ')} found`.green);
  } else {
    log.for(`Unmanaged ${depTypes.join(', ')}: `, () => {
      Object.keys(modulesDeps).forEach(el => log.info(`${el} (${modulesDeps[el].join(', ')})`));
    });

    // console.log(JSON.stringify(modulesDeps, null, 2));
  }
}

const projectRoot = findProjectRoot(process.cwd());
assert.assertGitRepo(projectRoot, log);

program.parse(process.argv);
program.help();

function forCommand(name, fn) {
  return (opts) => {
    log.exec(name, () => {
      const conf = config(projectRoot);
      fn(octopus({cwd: projectRoot, excludes: conf.exclude}), conf, opts);
      process.exit(0);
    });
  };
}

function getModulesAndVersions(modules) {
  return modules.reduce((prev, curr) => {
    prev[curr.npm.name] = `~${curr.npm.version}`;
    return prev;
  }, {});
}
