const fixtures = require('./support/fixtures'),
  expect = require('chai').expect,
  shelljs = require('shelljs');

describe('octo-init', function() {
  this.timeout(10000);

  it('create new octopus.json file and add .git hook if it is missing', () => {
    const project = fixtures.empty()
      .addFolder('.git');

    project.inDir(ctx => {
      const out = ctx.octo('init');

      expect(out).to.be.string('Executing \'init\'');
      expect(out).to.be.string('Adding default configuration file (octopus.json)\n  Done.');
      expect(out).to.be.string('Adding default git hook (.git/hooks/pre-push)\n  Done.');

      expect(fixtures.defaults.octopusJson).to.deep.equal(ctx.readJsonFile('octopus.json'));
      expect(fixtures.defaults.gitHook).to.equal(ctx.readFile('.git/hooks/pre-push'));
    });
  });

  it('should fail if init is executed not in root of git repo', () => {
    fixtures.empty().inDir(ctx => {
      expect(() => ctx.octo('init')).to.throw('Must execute in root of git repo');
    });
  });

  it('should not overwrite existing octopus.json file', () => {
    const existingOctopusJsonFile = {key: 'value'};
    const project = fixtures.empty()
      .addFolder('.git')
      .addFile('octopus.json', existingOctopusJsonFile);

    project.inDir(ctx => {
      const out = ctx.octo('init');

      expect(out).to.be.string('Existing configuration file exists (octopus.json) - skipping');
      expect(ctx.readJsonFile('octopus.json')).to.deep.equal(existingOctopusJsonFile);
    });
  });

  it('should backup existing git pre-push hook if exists', () => {
    const existingGitPrePushHook = 'file content';
    const project = fixtures.empty()
      .addFile('.git/hooks/pre-push', existingGitPrePushHook);

    project.inDir(ctx => {
      const out = ctx.octo('init');

      expect(out).to.be.string('Existing git hook (.git/hooks/pre-push) found - backed-up.');
      expect(out).to.be.string('Adding default git hook (.git/hooks/pre-push)\n  Done.');
      expect(ctx.readFile('.git/hooks/pre-push')).to.equal(fixtures.defaults.gitHook);
      expect(ctx.readFile('.git/hooks/pre-push.backup-*')).to.equal(existingGitPrePushHook)
    });
  });

  it('should not add git hook if -n argument is provided', () => {
    const project = fixtures.empty()
      .addFolder('.git');

    project.inDir(ctx => {
      const out = ctx.octo('init -n');

      expect(out).to.not.be.string('Adding default git hook (.git/hooks/pre-push)\n  Done.');
      expect(shelljs.test('-f', '.git/hooks/pre-push')).to.equal(false);
    });
  });

  it.skip('should execute postInit script if defined in octopus.json');

  it.skip('should execute nvm install if nvm=true is defined in octopus.json');
});
