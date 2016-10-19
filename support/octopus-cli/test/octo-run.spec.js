'use strict';
const fixtures = require('./support/fixtures'),
  expect = require('chai').expect,
  shelljs = require('shelljs');

describe('octo-run', function () {
  this.timeout(10000);

  it('should display help', () => {
    fixtures.project().inDir(ctx => {
      const out = ctx.octo('help run');

      expect(out).to.be.string('Usage: octo run');
    });
  });

  it('should display help if no sub-command is provided', () => {
    fixtures.project().inDir(ctx => {
      expect(() => ctx.octo('run')).to.throw('Usage: octo run');
    });
  });

  it('should allow execution from path within project', () => {
    fixtures.project().inDir(ctx => {
      ctx.module('a', module => {
        expect(() => module.octo('run')).to.throw('Usage: octo run');
      });
    });
  });

  it('should run provided command modules with changes by default and not mark modules as built', () => {
    aProject().markBuilt().inDir(ctx => {
      ctx.exec('sleep 2; touch c/touch');
      const out = ctx.octo('run test');

      expect(out).to.be.string('Executing \'octo run test\'');

      expect(out).to.be.string('c (c) (1/1)');
      expect(out).to.not.be.string('a (a)');
      expect(out).to.not.be.string('b (b)');

      expect(shelljs.test('-f', 'a/tested')).to.equal(false);
      expect(shelljs.test('-f', 'b/tested')).to.equal(false);
      expect(ctx.readFile('c/tested')).to.equal('c\n');

      expect(ctx.octo('run test')).to.be.string('c (c) (1/1)');
    });
  });

  it('should run multiple commands', () => {
    aProject().inDir(ctx => {
      const out = ctx.octo('run test verify');

      expect(out).to.be.string('Executing \'octo run test verify\'');

      expect(out).to.be.string('a (a) (1/3)');
      expect(out).to.be.string('b (b) (2/3)');
      expect(out).to.be.string('c (c) (3/3)');

      expect(ctx.readFile('a/tested')).to.equal('a\n');
      expect(ctx.readFile('b/tested')).to.equal('b\n');
      expect(ctx.readFile('c/tested')).to.equal('c\n');
      expect(ctx.readFile('a/verified')).to.equal('a\n');
      expect(ctx.readFile('b/verified')).to.equal('b\n');
      expect(ctx.readFile('c/verified')).to.equal('c\n');
    });
  });

  it('should run command for all modules if -a is provided', () => {
    aProject().markBuilt().inDir(ctx => {
      const out = ctx.octo('run -a test');

      expect(out).to.be.string('Executing \'octo run test\'');

      expect(out).to.be.string('a (a) (1/3)');
      expect(out).to.be.string('b (b) (2/3)');
      expect(out).to.be.string('c (c) (3/3)');

      expect(ctx.readFile('a/tested')).to.equal('a\n');
      expect(ctx.readFile('b/tested')).to.equal('b\n');
      expect(ctx.readFile('c/tested')).to.equal('c\n');
    });
  });

  it('should run command and do mark modules as built if -b is provided', () => {
    aProject().markBuilt().inDir(ctx => {
      ctx.exec('sleep 2; touch c/touch');

      expect(ctx.octo('run -b test')).to.be.string('c (c) (1/1)');
      expect(ctx.octo('run -b test')).to.be.string('no modules with changes found');
    });
  });

  it('should link modules on install', () => {
    aProject().inDir(ctx => {
      const out = ctx.octo('run install');

      expect(out).to.be.string('Executing \'octo run install\'');

      expect(out).to.be.string('a (a) (1/3)');
      expect(out).to.be.string('b (b) (2/3)');
      expect(out).to.be.string('c (c) (3/3)');

      expect(shelljs.test('-L', 'b/node_modules/a')).to.equal(true);
      expect(shelljs.test('-L', 'c/node_modules/b')).to.equal(true);
    });
  });

  it.skip('should run command from octopus.json if present');
  it.skip('should not allow to override install, link commands in octopus.json and emit warning');

  function aProject() {
    const scripts = {test: 'echo | pwd | grep -o \'[^/]*$\' > tested', verify: 'echo | pwd | grep -o \'[^/]*$\' > verified'};
    return fixtures.project()
      .module('a', module => module.packageJson({version: '1.0.0', scripts}))
      .module('b', module => module.packageJson({version: '1.0.1', dependencies: {'a': '~1.0.0'}, scripts}))
      .module('c', module => module.packageJson({version: '1.1.0', dependencies: {'b': '~1.0.1'}, scripts}));
  }
});