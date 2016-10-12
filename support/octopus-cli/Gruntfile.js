'use strict';
const shelljs = require('shelljs'),
  octopus = require('./lib/octopus');

const deps = {};

const peerDeps = {};

module.exports = function (grunt) {
  const exec = execFn(grunt);
  const octo = octopus({
    cwd: process.cwd(),
    excludes: ['octopus-cli']
  });

  grunt.registerTask('default', ['build']);

  grunt.registerTask('changed', 'Show modules that have changes or depend on modules that have changes (and needs rebuilding)', () => {
    const rebuild = octo.modules.filter(module => module.needsRebuild());
    rebuild.forEach((module, i) => {
      if (module.hasChanges()) {
        console.log(`  ${module.relativePath} ${i + 1}/${rebuild.length} (changed)`.green);
      } else {
        console.log(`  ${module.relativePath} ${i + 1}/${rebuild.length} (dependency changed)`);
      }
    });
  });

  grunt.registerTask('clean', 'Clean all modules', () => {
    octo.modules.forEach((module, i) => module.inDir(() =>
      exec('rm -rf node_modules && rm -rf target && rm -f npm-debug.log && rm -f npm-shrinkwrap.json', `  Cleaning ${module.relativePath}  ${i + 1}/${octo.modules.length}`)
    ));
  });

  grunt.registerTask('install', 'Install and link modules together without build/test phases', () => {
    const changed = octo.modules.filter(module => module.needsRebuild());
    changed.forEach(module => module.markUnbuilt());
    changed.forEach((module, i) => {
      const links = module.links();
      if (links) {
        module.inDir(() => exec(`npm link ${links.join(' && npm link ')} && npm install`, `Installing ${module.relativePath} ${i + 1}/${changed.length}`));
      } else {
        module.inDir(() => exec(`npm install`, `Installing ${module.relativePath} ${i + 1}/${changed.length}`));
      }
      module.markBuilt();
    });
  });


  grunt.registerTask('build', 'Build modules with changes and down resulting dependency tree', () => {
    const changed = octo.modules.filter(module => module.needsRebuild());
      changed.forEach(module => module.markUnbuilt());
      changed.forEach((module, i) => {
        const links = module.links();
        if (links) {
          module.inDir(() => exec(`npm link ${links.join(' && npm link ')} && npm install && npm run build && npm test`, `Building ${module.relativePath} ${i + 1}/${changed.length}`));
        } else {
          module.inDir(() => exec(`npm install && npm run build && npm test`, `Building ${module.relativePath} ${i + 1}/${changed.length}`));
        }
        module.markBuilt();
      });
  });

  grunt.registerTask('test', 'Build modules (only tests) with changes and down resulting dependency tree', () => {
    const changed = octo.modules.filter(module => module.needsRebuild());
    changed.forEach(module => module.markUnbuilt());
      changed.forEach(module => {
        exec(`npm run build && npm test`, `Testing ${module.relativePath} ${i + 1}/${changed.length}`);
        module.markBuilt();
      });
  });
  //
  // grunt.registerTask('sync-deps', () => {
  //   octo.modules.forEach(module => {
  //     module.packageJson.overwrite({dependencies: deps, peerDependencies: peerDeps, devDependencies: deps});
  //   });
  // });
  //
  // grunt.registerTask('sync-deps', () => {
  //   octo.modules.forEach(module => {
  //     module.packageJson.overwrite({dependencies: deps, peerDependencies: peerDeps, devDependencies: deps});
  //   });
  // });

  function execFn(grunt) {
    return (cmd, desc) => {
      console.log(`${desc.green} (${cmd.yellow})`);
      const res = shelljs.exec(cmd, {silent: true});
      res.stdout && grunt.verbose.write(res.stdout);
      res.stderr && grunt.verbose.error(res.stderr);
      if (res.code) {
        console.log(res.stdout);
        console.error(res.stderr.red);
        grunt.fail.fatal(`Command failed with code: ${res.code}`.red);
      }
    }
  }
};

