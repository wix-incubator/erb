'use strict';
const fixtures = require('./support/fixtures'),
  expect = require('chai').expect,
  shelljs = require('shelljs'),
  runMode = require('wix-run-mode');

describe('octo-bootstrap', function () {
  this.timeout(10000);

  if (!runMode.isCI()) {


    it('should display help', () => {
      fixtures.project().inDir(ctx => {
        const out = ctx.octo('help bootstrap');

        expect(out).to.be.string('Usage: octo bootstrap');
      });
    });

    it('should allow execution from path within project', () => {
      fixtures.project().inDir(ctx => {
        ctx.module('a', () => {
          const out = ctx.octo('bootstrap');

          expect(out).to.be.string('Executing \'octo bootstrap\'');
        });
      });
    });

    it('should install and link modules', () => {
      aProject().inDir(ctx => {
        const out = ctx.octo('bootstrap');

        expect(out).to.be.string('Executing \'octo bootstrap\'');

        expect(out).to.be.string('a (a) (1/3)');
        expect(out).to.be.string('b (b) (2/3)');
        expect(out).to.be.string('c (c) (3/3)');

        expect(shelljs.test('-L', 'b/node_modules/a')).to.equal(true);
        expect(shelljs.test('-L', 'c/node_modules/b')).to.equal(true);
      });
    });

    it('should display output from underlying commands if -v is provided', () => {
      aProject().inDir(ctx => {
        const out = ctx.octo('bootstrap -v');

        expect(out).to.be.string('Executing \'octo bootstrap\'');
        expect(out).to.be.string('a (a) (1/3)');
        expect(out).to.be.string('npm WARN a@1.0.0 No description');
      });
    });

    it('should rebuild all modules if -a is provided', () => {
      aProject().inDir(ctx => {
        ctx.octo('modules build');
        expect(ctx.octo('bootstrap')).to.be.string('no modules with changes found');

        const out = ctx.octo('bootstrap -a');
        expect(out).to.be.string('Executing \'octo bootstrap\'');
        expect(out).to.be.string('a (a) (1/3)');
        expect(shelljs.test('-L', 'c/node_modules/b')).to.equal(true);
      });
    });

    it('should not mark modules as built if -n flag is provided', () => {
      aProject().inDir(ctx => {
        const out = ctx.octo('bootstrap -n');
        expect(out).to.be.string('Executing \'octo bootstrap\'');
        expect(out).to.be.string('a (a) (1/3)');
        expect(shelljs.test('-L', 'c/node_modules/b')).to.equal(true);

        const out2 = ctx.octo('bootstrap -n');
        expect(out2).to.be.string('Executing \'octo bootstrap\'');
        expect(out2).to.be.string('a (a) (1/3)');
      });
    });

    function aProject() {
      const scripts = {
        test: 'echo | pwd | grep -o \'[^/]*$\' > tested',
        verify: 'echo | pwd | grep -o \'[^/]*$\' > verified'
      };
      return fixtures.project()
        .module('a', module => module.packageJson({version: '1.0.0', scripts}))
        .module('b', module => module.packageJson({version: '1.0.1', dependencies: {'a': '~1.0.0'}, scripts}))
        .module('c', module => module.packageJson({version: '1.1.0', dependencies: {'b': '~1.0.1'}, scripts}));
    }
  }
});
