'use strict';
const chai = require('chai'),
  expect = chai.expect,
  exec = require('child_process').execSync;

describe('wix-run-mode', () => {

  describe('isCI', () => {

    it('should return "true" if module detects that app is running in ci (env IS_BUILD_AGENT is present)', () => {
      expect(run('node ./test/apps/ci.js', {IS_BUILD_AGENT: true})).to.equal('true');
    });

    it('should return "false" if module considers app to be executed not in ci (env IS_BUILD_AGENT not present)', () => {

      expect(run('node ./test/apps/ci.js')).to.equal('false');
    });
  });

  describe('isProduction', () => {

    it('should return "true" if production environment detected (NODE_ENV is set to "production")', () => {
      expect(run('node ./test/apps/production.js', {NODE_ENV: 'production'})).to.equal('true');
    });

    it('should return "false" production environment not detected (NODE_ENV is not set to "production")', () => {
      expect(run('node ./test/apps/production.js')).to.equal('false');
    });
  });


  describe('isDebug', () => {

    it('should return "true" if process is being executed with "--debug" node switch', () => {
      expect(run('node --debug ./test/apps/debug.js')).to.equal('true');
    });

    it.skip('should return "true" if process is being executed with "--debug-brk" node switch', () => {

    });

    it('should return "false" if process is being executed without debug switches', () => {
      expect(run('node ./test/apps/debug.js')).to.equal('false');
    });
  });

  function run(cmd, env) {
    const effectiveEnv = env || {};
    return exec(cmd, {env: effectiveEnv}).toString().replace('\n', '');
  }
});