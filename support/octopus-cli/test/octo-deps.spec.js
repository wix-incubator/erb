'use strict';
const fixtures = require('./support/fixtures'),
  expect = require('chai').expect;

describe('octo-deps', function () {
  this.timeout(10000);

  it('should display help', () => {
    fixtures.project().inDir(ctx => {
      const out = ctx.octo('help deps');

      expect(out).to.be.string('Usage: octo deps');
    });
  });

  it('should display help if no sub-command is provided', () => {
    fixtures.project().inDir(ctx => {
      expect(() => ctx.octo('deps')).to.throw('Usage: octo deps');
    });
  });

  describe('extraneous', () => {

    it('should show managed dependencies that are not used in modules', () => {
      const project = fixtures.project()
        .module('a', module => module.packageJson({version: '1.0.0'}))
        .addFile('octopus.json', {
          dependencies: {one: '1.2.3'},
          devDependencies: {two: '1.2.3'},
          peerDependencies: {three: '1.2.3'}
        });

      project.inDir(ctx => {
        const out = ctx.octo('deps extraneous');

        expect(out).to.be.string('Executing \'octo deps extraneous\'');
        expect(out).to.be.string('one');
        expect(out).to.be.string('two');
        expect(out).to.be.string('three');
      });
    });

    it('should say there are no extraneous dependencies', () => {
      aProject().inDir(ctx => {
        const out = ctx.octo('deps extraneous');
        expect(out).to.be.string('No extraneous dependencies, devDependencies found');
        expect(out).to.be.string('No extraneous peerDependencies found');
      });
    });

    it('should say there are no modules for a project with no modules', () => {
      fixtures.project().inDir(ctx => {
        expect(ctx.octo('deps extraneous')).to.be.string('no modules found');
      });
    });
  });

  describe('unmanaged', () => {

    it('should show module dependencies that are not included in octopus.json', () => {
      const project = fixtures.project()
        .module('a', module => module.packageJson({
          version: '1.0.0',
          dependencies: {lodash: '1.2.2', commander: '2.1.1'}
        }))
        .module('b', module => module.packageJson({
          version: '1.0.1',
          dependencies: {'a': '~1.0.0', commander: '1.1.1'},
          peerDependencies: {jam: '0.0.1'}
        }))
        .module('c', module => module.packageJson({
          version: '1.1.0',
          dependencies: {'b': '~1.0.1'},
          devDependencies: {react: '2.1.1'}
        }))
        .addFile('octopus.json', {dependencies: {lodash: '1.2.3'}});

      project.inDir(ctx => {
        const out = ctx.octo('deps unmanaged');

        expect(out).to.be.string('Executing \'octo deps unmanaged\'');
        expect(out).to.be.string('commander (2.1.1, 1.1.1)');
        expect(out).to.be.string('react (2.1.1)');
        expect(out).to.be.string('jam (0.0.1)');
      });
    });

    it('should say there are no unmanaged dependencies', () => {
      aProject().inDir(ctx => {
        const out = ctx.octo('deps unmanaged');
        expect(out).to.be.string('No unmanaged dependencies, devDependencies found');
        expect(out).to.be.string('No unmanaged peerDependencies found');
      });
    });

    it('should say there are no modules for a project with no modules', () => {
      fixtures.project().inDir(ctx => {
        expect(ctx.octo('deps unmanaged')).to.be.string('no modules found');
      });
    });
  });

  describe('latest', () => {
    it('should display latest dependencies if any', () => {

      const project = fixtures.project()
        .module('a', module => module.packageJson({version: '1.0.0'}))
        .module('b', module => module.packageJson({version: '1.0.1', dependencies: {'a': '~1.0.0'}}))
        .module('c', module => module.packageJson({version: '1.1.0', dependencies: {'b': '~1.0.1'}}))
        .addFile('octopus.json', {
          dependencies: {lodash: '0.0.1'},
          devDependencies: {commander: '0.0.1'},
          peerDependencies: {mocha: '0.0.1'}
        });

      project.inDir(ctx => {
        const out = ctx.octo('deps latest');

        expect(out).to.be.string('Executing \'octo deps latest\'');
        expect(out).to.be.string('lodash (0.0.1 -> ');
        expect(out).to.be.string('commander (0.0.1 -> ');
        expect(out).to.be.string('mocha (0.0.1 -> ');
      });
    });

    it('should say there are no updates for dependencies', () => {
      aProject().inDir(ctx => {
        const out = ctx.octo('deps latest');
        expect(out).to.be.string('No updates for dependencies, devDependencies found');
        expect(out).to.be.string('No updates for peerDependencies found');
      });
    });

    it('should say there are no modules for a project with no modules', () => {
      fixtures.project().inDir(ctx => {
        expect(ctx.octo('deps latest')).to.be.string('no modules found');
      });
    });
  });

  describe('sync', () => {
    it('should show dependencies to sync', () => {

      const project = fixtures.project()
        .module('a', module => module.packageJson({
          version: '1.0.0',
          dependencies: {lodash: '1.1.1'},
          devDependencies: {commander: '1.1.1'},
          peerDependencies: {mocha: '1.1.1'}
        }))
        .addFile('octopus.json', {
          dependencies: {lodash: '1.0.0', commander: '2.0.0'},
          peerDependencies: {mocha: '>=3.0.0'}
        });

      project.inDir(ctx => {
        const out = ctx.octo('deps sync');

        expect(out).to.be.string('Executing \'octo deps sync\'');
        expect(out).to.be.string('lodash (dependencies) (1.1.1 -> 1.0.0');
        expect(out).to.be.string('commander (devDependencies) (1.1.1 -> 2.0.0');
        expect(out).to.be.string('mocha (peerDependencies) (1.1.1 -> >=3.0.0');

        const packageJson = ctx.readJsonFile('a/package.json');

        expect(packageJson).to.contain.deep.property('dependencies.lodash', '1.1.1');
        expect(packageJson).to.contain.deep.property('devDependencies.commander', '1.1.1');
        expect(packageJson).to.contain.deep.property('peerDependencies.mocha', '1.1.1');
      });
    });

    it('should show dependencies to sync and persist changes if --save flag is provided', () => {

      const project = fixtures.project()
        .module('a', module => module.packageJson({
          version: '1.0.0',
          dependencies: {lodash: '1.1.1'},
          devDependencies: {commander: '1.1.1'},
          peerDependencies: {mocha: '1.1.1'}
        }))
        .addFile('octopus.json', {
          dependencies: {lodash: '1.0.0', commander: '2.0.0'},
          peerDependencies: {mocha: '>=3.0.0'}
        });

      project.inDir(ctx => {
        const out = ctx.octo('deps sync -s');

        expect(out).to.be.string('Executing \'octo deps sync\'');
        expect(out).to.be.string('lodash (dependencies) (1.1.1 -> 1.0.0');
        expect(out).to.be.string('commander (devDependencies) (1.1.1 -> 2.0.0');
        expect(out).to.be.string('mocha (peerDependencies) (1.1.1 -> >=3.0.0');

        const packageJson = ctx.readJsonFile('a/package.json');

        expect(packageJson).to.contain.deep.property('dependencies.lodash', '1.0.0');
        expect(packageJson).to.contain.deep.property('devDependencies.commander', '2.0.0');
        expect(packageJson).to.contain.deep.property('peerDependencies.mocha', '>=3.0.0');
      });
    });

    it('should say there are no dependencies to sync', () => {
      aProject().inDir(ctx => {
        const out = ctx.octo('deps sync');
        expect(out).to.be.string('No un-synced dependencies found');
      });
    });

    it('should say there are no modules for a project with no modules', () => {
      fixtures.project().inDir(ctx => {
        expect(ctx.octo('deps sync')).to.be.string('no modules found');
      });
    });
  });

  function aProject() {
    return fixtures.project()
      .module('a', module => module.packageJson({version: '1.0.0'}))
      .module('b', module => module.packageJson({version: '1.0.1', dependencies: {'a': '~1.0.0'}}))
      .module('c', module => module.packageJson({version: '1.1.0', dependencies: {'b': '~1.0.1'}}));
  }
});