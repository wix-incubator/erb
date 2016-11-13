const fixtures = require('./support/fixtures'),
  expect = require('chai').expect,
  shelljs = require('shelljs');

describe('octo-idea', function () {
  this.timeout(10000);

  it('should display help', () => {
    fixtures.project().inDir(ctx => {
      const out = ctx.octo('help idea');

      expect(out).to.be.string('Usage: octo idea');
    });
  });

  it('should generate idea project files', () => {
    aProject().inDir(ctx => {
      const out = ctx.octo('idea');

      expect(out).to.be.string('Executing \'octo idea\'');
      expect(out).to.be.string('generating .idea folder');
      expect(out).to.be.string('a (a) (1/2)\n  generating .iml file');
      expect(out).to.be.string('b (b) (2/2)\n  generating .iml file');

      assertIdeaFilesGenerated();
    });
  });

  it('should allow execution from path within project', () => {
    aProject().inDir(ctx => {
      let out = '';
      ctx.module('a', module => out = module.octo('idea'));

      expect(out).to.be.string('Executing \'octo idea\'');
      assertIdeaFilesGenerated();
    });
  });

  it('should set language level to ES6', () => {
    aProject().inDir(ctx => {
      ctx.octo('idea');
      expect(shelljs.cat('.idea/workspace.xml').stdout).to.be.string('<property name="JavaScriptLanguageLevel" value="ES6" />');
    });
  });

  it('removes existing .idea project files before generating new ones', () => {
    aProject().inDir(ctx => {
      ctx.octo('idea');
      const out = ctx.octo('idea');

      expect(out).to.be.string('Executing \'octo idea\'');
      expect(out).to.be.string('Existing .idea folder found, deleting');
      expect(out).to.be.string('Existing .iml file found, deleting');

      assertIdeaFilesGenerated();
    });
  });

  it('generates [module-name].iml with node_modules excluded so idea would not index all deps', () => {
    aProject().inDir(ctx => {
      ctx.octo('idea');
      expect(shelljs.cat('a/a.iml').stdout).to.be.string('<excludeFolder url="file://$MODULE_DIR$/node_modules" />');
    });
  });

  it('generates Mocha run configurations for all modules with mocha, interpreter and env set', () => {
    aProject().inDir(ctx => {
      const node = shelljs.exec('which node').stdout.split('/node/')[1].replace('\n', '');
      ctx.octo('idea');

      expect(shelljs.cat('.idea/workspace.xml').stdout).to.be.string('/node_modules/mocha');
      expect(shelljs.cat('.idea/workspace.xml').stdout).to.be.string('<configuration default="false" name="a" type="mocha-javascript-test-runner" factoryName="Mocha">');
      expect(shelljs.cat('.idea/workspace.xml').stdout).to.be.string('<env name="DEBUG" value="wix:*" />');
      expect(shelljs.cat('.idea/workspace.xml').stdout).to.be.string('<test-kind>PATTERN</test-kind>');
      expect(shelljs.cat('.idea/workspace.xml').stdout).to.be.string('<test-pattern>test/**/*.spec.js test/**/*.it.js</test-pattern>');
      expect(shelljs.cat('.idea/workspace.xml').stdout).to.be.string(`${node}</node-interpreter>`);
    });
  });

  it('creates git-based ./idea/vcs.xml', () => {
    aProject().inDir(ctx => {
      ctx.octo('idea');

      expect(shelljs.cat('.idea/vcs.xml').stdout).to.be.string('<mapping directory="$PROJECT_DIR$" vcs="Git" />');
    });
  });

  it('should say there are no modules for a project with no modules', () => {
    fixtures.project().inDir(ctx => {
      expect(ctx.octo('idea')).to.be.string('no modules found');
    });
  });

  function aProject() {
    return fixtures.project()
      .module('a', module => module.packageJson({version: '1.0.0'}))
      .module('b', module => module.packageJson({version: '1.0.1', dependencies: {'a': '~1.0.0'}}));
  }

  function assertIdeaFilesGenerated() {
    expect(shelljs.test('-d', '.idea')).to.equal(true);
    expect(shelljs.test('-f', '.idea/modules.xml')).to.equal(true);
    expect(shelljs.test('-f', '.idea/vcs.xml')).to.equal(true);
    expect(shelljs.test('-f', '.idea/workspace.xml')).to.equal(true);
    expect(shelljs.test('-f', 'a/a.iml')).to.equal(true);
    expect(shelljs.test('-f', 'b/b.iml')).to.equal(true);
  }
});
