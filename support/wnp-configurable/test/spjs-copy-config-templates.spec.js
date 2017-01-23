const expect = require('chai').expect,
  shelljs = require('shelljs'),
  join = require('path').join;

describe('copy config templates', function () {
  this.timeout(60000);
  const testTemplateDir = join(process.cwd(), './target/templates');
  const testModuleDir = join(process.cwd(), './target/test-module');

  before(() => shelljs.exec('npm pack .'));
  after(() => shelljs.rm('-f', 'wnp-configurable-*.tgz'));

  beforeEach(() => {
    delete process.env.APP_TEMPL_DIR;
    delete process.env.NODE_ENV;
    shelljs.rm('-rf', testModuleDir);
    shelljs.rm('-rf', testTemplateDir);
    shelljs.mkdir('-p', testModuleDir);
    shelljs.mkdir('-p', testTemplateDir);
  });

  afterEach(() => {
    shelljs.popd();
    shelljs.rm('-rf', testModuleDir);
  });

  describe('module', () => {
    const templateModuleDir = join(process.cwd(), './test/template-module');

    beforeEach(() => {
      shelljs.cp('-R', templateModuleDir + '/', testModuleDir);
      shelljs.pushd(testModuleDir);
    });


    it('should print diagnostics and be a no-op given script is executed not during production install (NODE_ENV !== production)', () => {
      process.env.NODE_ENV = 'dev';

      const res = runCmd();

      expect(res.code).to.equal(0);
      expect(runCmd().stdout).to.be.string('wnp-copy-config-templates(test-pkg): NODE_ENV=\'dev\', skipping...');
    });

    it('should copy config templates to existing folder identified by APP_TEMPL_DIR during install in production (NODE_ENV !== production)', () => {
      process.env.NODE_ENV = 'production';
      process.env.APP_TEMPL_DIR = testTemplateDir;

      expect(shelljs.test('-d', testTemplateDir)).to.equal(true);

      const res = runCmd();

      expect(res.code).to.equal(0);
      expect(res.stdout).to.be.string(`wnp-copy-config-templates(test-pkg): NODE_ENV='production', copying configs from '${testModuleDir}/templates' to '${testTemplateDir}'`);

      expect(filesIn(testTemplateDir)).to.deep.equal(['config.erb']);
    });

    it('should pre-create folder identified by APP_TEMPL_DIR given it does not exist if config template copying should be performed', () => {
      process.env.NODE_ENV = 'production';
      process.env.APP_TEMPL_DIR = testTemplateDir;

      shelljs.rm('-rf', testTemplateDir);
      expect(shelljs.test('-d', testTemplateDir)).to.equal(false);

      const res = runCmd();

      expect(res.code).to.equal(0);
      expect(res.stdout).to.be.string(`wnp-copy-config-templates(test-pkg): NODE_ENV='production', copying configs from '${testModuleDir}/templates' to '${testTemplateDir}'`);
      expect(filesIn(testTemplateDir)).to.deep.equal(['config.erb']);
    });

    it('should fail with exit code != 0 given executed in production (NODE_ENV !== production) and no APP_TEMPL_DIR is set', () => {
      process.env.NODE_ENV = 'production';

      shelljs.rm('-rf', testTemplateDir);
      expect(shelljs.test('-d', testTemplateDir)).to.equal(false);

      const res = runCmd();
      expect(res.code).to.not.equal(0);
      expect(res.stderr).to.be.string('NODE_ENV=\'production\', but APP_TEMPL_DIR not set, cannot copy config templates.');
    });

    it('should emit warning if config template copying should be performed, but no ./templates dir is present', () => {
      process.env.NODE_ENV = 'production';
      process.env.APP_TEMPL_DIR = testTemplateDir;

      shelljs.rm('-rf', testModuleDir + '/templates');
      expect(shelljs.test('-d', testModuleDir + '/templates')).to.equal(false);

      const res = runCmd();

      expect(res.code).to.equal(0);
      expect(res.stderr).to.be.string(`wnp-copy-config-templates(test-pkg): NODE_ENV='production', but '${testModuleDir}/templates' does not exist - skipping...`);
    });

    it('should emit warning if config template copying should be performed, but no files in ./templates dir are present', () => {
      process.env.NODE_ENV = 'production';
      process.env.APP_TEMPL_DIR = testTemplateDir;

      shelljs.rm('-r', testModuleDir + '/templates/*');
      expect(shelljs.test('-d', testModuleDir + '/templates')).to.equal(true);
      expect(filesIn(testModuleDir + '/templates')).to.deep.equal([]);

      const res = runCmd();

      expect(res.code).to.equal(0);
      expect(res.stderr).to.be.string(`wnp-copy-config-templates(test-pkg): NODE_ENV='production', but '${testModuleDir}/templates' is empty - skipping...`);
    });
  });

  describe('eval', () => {
    const templateModuleDir = join(process.cwd(), './test/template-module-eval');

    beforeEach(() => {
      shelljs.cp('-R', templateModuleDir + '/', testModuleDir);
      shelljs.pushd(testModuleDir);
    });

    it('should copy config templates to existing folder identified by APP_TEMPL_DIR during install in production (NODE_ENV !== production)', () => {
      process.env.NODE_ENV = 'production';
      process.env.APP_TEMPL_DIR = testTemplateDir;

      expect(shelljs.test('-d', testTemplateDir)).to.equal(true);

      const res = runCmd();

      expect(res.code).to.equal(0);
      expect(res.stdout).to.be.string(`wnp-copy-config-templates(test-pkg): NODE_ENV='production', copying configs from '${testModuleDir}/templates' to '${testTemplateDir}'`);

      expect(filesIn(testTemplateDir)).to.deep.equal(['config.erb']);
    });
  });
  
  
  function filesIn(dir) {
    return shelljs.ls(dir);
  }

  function runCmd() {
    return shelljs.exec('npm install');
  }
});
