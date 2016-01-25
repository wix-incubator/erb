'use strict';
const chai = require('chai'),
  expect = chai.expect,
  exec = require('child_process').execSync;

describe('wix-run-mode', () => {

  describe('isDebug', () => {

    it('should return "true" if NODE_ENV is set to "production"', () => {
      expect(run('NODE_ENV=production node ./test/apps/production.js')).to.equal('true');
    });

    it('should return "false" if NODE_ENV is not set to "production"', () => {
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

  function run(cmd) {
    return exec(cmd).toString().replace('\n', '');
  }
});