const fixtures = require('./support/fixtures'),
  expect = require('chai').expect;

describe('octo-modules', function () {
  this.timeout(10000);

  it('should display help', () => {
    fixtures.project().inDir(ctx => {
      const out = ctx.octo('help modules');

      expect(out).to.be.string('Usage: octo modules');
    });
  });

  it('should display help if no sub-command is provided', () => {
    fixtures.project().inDir(ctx => {
      expect(() => ctx.octo('modules')).to.throw('Usage: octo modules');
    });
  });

  describe('list', () => {

    it('should list modules with versions', () => {
      aProject().inDir(ctx => {
        const out = ctx.octo('modules list');

        expect(out).to.be.string('Executing \'octo modules list\'');

        expect(out).to.be.string('a (a) (1.0.0) (1/3)');
        expect(out).to.be.string('b (b) (1.0.1) (2/3)');
        expect(out).to.be.string('c (c) (1.1.0) (3/3)');
      });
    });

    it('should say there are no modules for a project with no modules', () => {
      fixtures.project().inDir(ctx => {
        expect(ctx.octo('modules list')).to.be.string('no modules found');
      });
    });

  });

  describe('changed', () => {

    it('should list all modules with changes', () => {
      aProject().inDir(ctx => {
        const out = ctx.octo('modules changed');

        expect(out).to.be.string('Executing \'octo modules changed\'');
        expect(out).to.be.string('a (a) (changed) (1/3)');
        expect(out).to.be.string('b (b) (changed) (2/3)');
        expect(out).to.be.string('c (c) (changed) (3/3)');
      });
    });

    it('should show both modules with changes and dependent ones', () => {
      aProject().markBuilt().inDir(ctx => {
        ctx.exec('sleep 2; touch b/touch');
        const out = ctx.octo('modules changed');

        expect(out).to.not.be.string('a (a)');
        expect(out).to.be.string('b (b) (changed) (1/2)');
        expect(out).to.be.string('c (c) (dependency changed) (2/2)');
      });
    });

    it('should say there are no changed modules if all are built', () => {
      aProject().markBuilt().inDir(ctx => {
        expect(ctx.octo('modules changed')).to.be.string('no changed modules');
      });
    });

  });

  describe('build', () => {

    it('should make all modules built', () => {
      aProject().inDir(ctx => {
        let out = ctx.octo('modules build');
        expect(out).to.be.string('Executing \'octo modules build\'');
        expect(out).to.be.string('a (a) (1/3)');
        expect(out).to.be.string('b (b) (2/3)');
        expect(out).to.be.string('c (c) (3/3)');

        expect(ctx.octo('modules changed')).to.be.string('no changed modules');
      });
    });

    it('should make only changed modules built', () => {
      aProject().markBuilt().inDir(ctx => {
        ctx.exec('sleep 2; touch b/touch');
        const out = ctx.octo('modules build');
        expect(out).to.be.string('b (b) (1/2)');
        expect(out).to.be.string('c (c) (2/2)');
      });
    });

    it('should say there are no changed modules', () => {
      aProject().markBuilt().inDir(ctx => {
        expect(ctx.octo('modules build')).to.be.string('no changed modules');
      });
    });
  });

  describe('unbuild', () => {

    it('should unbuild only modules without changes', () => {
      aProject().markBuilt().inDir(ctx => {
        ctx.exec('sleep 2; touch b/touch');
        const out = ctx.octo('modules unbuild');

        expect(out).to.be.string('Executing \'octo modules unbuild\'');
        expect(out).to.be.string('a (a) (1/1)');

        expect(ctx.octo('modules build')).to.be.string('c (c) (3/3)');
      });
    });

    it('should say there is nothing to unbuild', () => {
      aProject().inDir(ctx => {
        expect(ctx.octo('modules unbuild')).to.be.string('no modules without changes');
      });
    });
  });

  describe('sync', () => {

    it('should display changes and exit with non-zero exit code but take no action by default', done => {
      const project = fixtures.project()
        .module('a', module => module.packageJson({version: '2.0.0'}))
        .module('b', module => module.packageJson({version: '1.0.1', dependencies: {'a': '~1.0.0'}}))
        .module('c', module => module.packageJson({version: '1.1.0', dependencies: {'b': '~1.0.1'}}))
        .markBuilt().gitCommit();

      project.inDir(ctx => {
        try {
          ctx.octo('modules sync');
          done(new Error('expected to fail'));
        } catch (e) {
          const out = e.output;
          
          expect(out).to.be.string('Un-synced module versions found, run "octo modules sync --save" to sync module versions.');
          expect(out).to.be.string('Executing \'octo modules sync\'');
          expect(out).to.be.string('b (b) (1/1)');
          expect(out).to.be.string('a: ~1.0.0 -> ~2.0.0');

          expect(ctx.exec('git status')).to.be.string('nothing to commit, working directory clean');
          done();
        }
      });
    });

    it('should display changes and update package.jsons given --save is provided', () => {
      const project = fixtures.project()
        .module('a', module => module.packageJson({version: '2.0.0'}))
        .module('b', module => module.packageJson({version: '1.0.1', dependencies: {'a': '~1.0.0'}}))
        .module('c', module => module.packageJson({version: '1.1.0', dependencies: {'b': '~1.0.1'}}))
        .markBuilt().gitCommit();

      project.inDir(ctx => {
        const out = ctx.octo('modules sync --save');

        expect(out).to.be.string('b (b) (1/1)');
        expect(out).to.be.string('a: ~1.0.0 -> ~2.0.0');

        expect(ctx.exec('git diff --stat')).to.be.string('1 file changed, 1 insertion(+), 1 deletion(-)');
        expect(ctx.readJsonFile('b/package.json')).to.contain.deep.property('dependencies.a', '~2.0.0');
      });
    });

    it('should say there is nothing to sync', () => {
      aProject().inDir(ctx => {
        expect(ctx.octo('modules sync')).to.be.string('all modules are in sync');
      });
    });
  });

  describe('where', () => {

    it('should require at least one module to be provided', () => {
      aProject().inDir(ctx => {
        let err;
        try {
          ctx.octo('modules where');
        } catch (e) {
          err = e;
        }

        expect(err.message).to.be.string('Not enough non-option arguments');
      });
    });

    it('should display where module is used', () => {
      aProject().inDir(ctx => {
        const out = ctx.octo('modules where b');

        expect(out).to.be.string('c (~1.0.1)');
        expect(out).to.not.be.string('a');
      });
    });

    it('should display message that module is not used anywhere', () => {
      aProject().inDir(ctx => {
        expect(ctx.octo('modules where c')).to.be.string('module \'c\' is not used in other modules');
      });
    });

    it('should display message that module does not exist', () => {
      aProject().inDir(ctx => {
        let err;
        try {
          ctx.octo('modules where woop');
        } catch (e) {
          err = e;
        }

        expect(err.message).to.be.string('module \'woop\' not found');
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
