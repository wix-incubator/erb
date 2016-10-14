'use strict';
const shelljs = require('shelljs'),
  octopus = require('./lib/octopus'),
  _ = require('lodash'),
  path = require('path');

module.exports = function (grunt) {
  const exec = execFn(grunt);
  const octo = octopus({cwd: process.cwd(), excludes: ['octopus-cli']});
  const config = JSON.parse(shelljs.cat(__dirname + '/../../octopus.json').stdout);
  const deps = config.dependencies;
  const peerDeps = config.peerDependencies;

  const opts = {
    force: grunt.option('force') || false,
    verbose: grunt.option('verbose') || false,
    save: grunt.option('save') || false
  };

  grunt.registerTask('default', ['build']);

  grunt.registerTask('clean', 'Clean all modules', () => {
    const modules = getModules();
    modules.forEach((module, i) => module.inDir(() =>
      exec('rm -rf node_modules && rm -rf target && rm -f npm-debug.log && rm -f npm-shrinkwrap.json', `  Cleaning ${module.relativePath}  ${i + 1}/${modules.length}`)
    ));
  });

  grunt.registerTask('install', 'Install and link modules together without build/test phases', () => {
    const modules = getModules();
    modules.forEach((module, i) =>
      module.inDir(() => exec(`${linksCmd(module)} npm --cache-min 300 install`, `Installing ${module.relativePath} ${i + 1}/${modules.length}`))
    );
  });

  function linksCmd(module) {
    const links = module.links();
    return links.length > 0 ? `npm link ${links.join('\' \'')} &&` : '';
  }

  grunt.registerTask('build', 'Build modules with changes and down resulting dependency tree', () => {
    const changed = getModules();
    changed.forEach(module => module.markUnbuilt());
    changed.forEach((module, i) => {
      module.inDir(() => exec(`${linksCmd(module)} npm --cache-min 300 install && npm run build && npm test`, `Building ${module.relativePath} ${i + 1}/${changed.length}`));
      module.markBuilt();
    });
  });

  grunt.registerTask('test', 'Build modules (only tests) with changes and down resulting dependency tree', () => {
    const changed = getModules();
    changed.forEach(module => module.markUnbuilt());
    changed.forEach((module, i) => {
      module.inDir(() => exec('npm run build && npm test', `Testing ${module.relativePath} ${i + 1}/${changed.length}`));
      module.markBuilt();
    });
  });

  grunt.registerTask('deps:unmanaged', 'List unmanaged dependencies', () => {
    const modules = octo.modules;
    const platformDeps = getModulesAndVersions(modules);

    unmanaged(modules, config.dependencies, platformDeps, ['dependencies', 'devDependencies']);
    unmanaged(modules, config.peerDependencies, platformDeps, ['peerDependencies']);
  });

  grunt.registerTask('deps:extraneous', 'List unmanaged dependencies', () => {
    const modules = octo.modules;
    const platformDeps = getModulesAndVersions(modules);
    extraneous(modules, config.dependencies, platformDeps, ['dependencies', 'devDependencies']);
    extraneous(modules, config.peerDependencies, platformDeps, ['peerDependencies']);
  });

  grunt.registerTask('deps:latest', 'List latest versions for deps', () => {
    updates(config.dependencies, 'dependencies/devDependencies');
    updates(config.peerDependencies, 'peerDependencies');
  });

  grunt.registerTask('deps:sync', 'Show module versions that could be updated', () => {
    const modules = octo.modules;
    modules.forEach((module, i) => {
      const diff = module.merge({dependencies: deps, peerDependencies: peerDeps, devDependencies: deps}, opts.save);
      if (diff) {
        console.log(`Syncing ${module.relativePath} ${i + 1}/${modules.length}`.green);
        console.log('package.json diff: ' + JSON.stringify(diff, null, 2));
      }
    });
  });

  grunt.registerTask('modules:changed', 'List modules that have changes or depend on modules that have changes (and needs rebuilding)', () => {
    const rebuild = octo.modules.filter(module => module.needsRebuild());
    rebuild.forEach((module, i) => console.log(`  ${module.relativePath} ${i + 1}/${rebuild.length} (${module.hasChanges() ? 'changed' : 'dependency changed'})`.green));
  });

  grunt.registerTask('modules:list', 'List all managed modules', () => {
    const rebuild = octo.modules.filter(module => module.needsRebuild());
    octo.modules.forEach((module, i) => console.log(`  ${module.relativePath} ${i + 1}/${rebuild.length}`.green));
  });

  grunt.registerTask('modules:sync', 'Sync module versions', () => {
    const modules = octo.modules;
    const depsAndVersions = getModulesAndVersions(modules);
    modules.forEach((module, i) => {
      const diff = module.merge({
        dependencies: depsAndVersions,
        peerDependencies: config.peerDependencies,
        devDependencies: depsAndVersions
      }, opts.save);
      if (diff) {
        console.log(`Syncing ${module.relativePath} ${i + 1}/${modules.length}`.green);
        console.log('package.json diff: ' + JSON.stringify(diff, null, 2));
      }
    });
  });

  function getModules() {
    return opts.force === true ? octo.modules : octo.modules.filter(module => module.needsRebuild());

  }

  function execFn(grunt) {
    return (cmd, desc) => {
      console.log(`${desc.green} (${cmd.yellow})`);
      const res = shelljs.exec(cmd, {silent: !opts.verbose});
      if (res.code) {
        console.log(res.stdout);
        console.error(res.stderr.red);
        grunt.fail.fatal(`Command failed with code: ${res.code}`.red);
      }
    }
  }
};

function getModulesAndVersions(modules) {
  return modules.reduce((prev, curr) => {
    prev[curr.npm.name] = `~${curr.npm.version}`;
    return prev;
  }, {});
}

function unmanaged(modules, deps, platformModules, depTypes) {
  const modulesDeps = {};
  modules.forEach(module => Object.assign.apply(null, [modulesDeps].concat(depTypes.map(type => module.packageJson[type]))));
  Object.keys(platformModules).forEach(name => delete modulesDeps[name]);
  Object.keys(deps).forEach(name => delete modulesDeps[name]);

  if (_.isEqual({}, modulesDeps)) {
    console.log(`No unmanaged ${depTypes.join(', ')} discovered`.green);
  } else {
    console.log(`Unmanaged ${depTypes.join(', ')}: `.green + JSON.stringify(modulesDeps, null, 2));
  }
}

function extraneous(modules, deps, platformModules, depTypes) {
  const dependencies = _.cloneDeep(deps);
  const modulesDeps = {};
  modules.forEach(module => Object.assign.apply(null, [modulesDeps].concat(depTypes.map(type => module.packageJson[type]))));
  Object.keys(platformModules).forEach(name => delete modulesDeps[name]);
  Object.keys(modulesDeps).forEach(name => delete dependencies[name]);

  if (_.isEqual({}, dependencies)) {
    console.log(`No extraneous ${depTypes.join(', ')} discovered`.green);
  } else {
    console.log(`Extraneous ${depTypes.join(', ')}: `.green + JSON.stringify(dependencies, null, 2));
  }
}


function updates(deps, type) {
  Object.keys(deps).forEach((depName) => {
    const currentVersion = deps[depName];
    const latestVersion = shelljs.exec(`npm show ${depName} version`, {silent: true}).stdout.replace('\n', '');
    if (currentVersion.indexOf(latestVersion) > -1) {
      console.log(`  ${type}: '${depName}' ${currentVersion} -> ${latestVersion}`.green);
    } else {
      console.log(`  ${type}: '${depName}' ${currentVersion} -> ${latestVersion}`.red);
    }
  });
}
