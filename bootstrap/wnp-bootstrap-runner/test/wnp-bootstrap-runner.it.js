'use strict';
const expect = require('chai').expect,
  testkit = require('wix-childprocess-testkit');

describe('runner it', function () {
  this.timeout(5000);

  describe('in debug mode', () => {
    const app = testkit
      .server('./test/test-app', {execArgv: ['--debug']}, testkit.checks.stdOut('pid: '))
      .beforeAndAfter();

    it('should run in same process given running in debug mode', () => {
      expect(app.stdout().join()).to.be.string(`pid: ${app.child().pid}`);
    });
  });

  describe('not in debug mode', () => {
    const app = testkit
      .server('./test/test-app', {}, testkit.checks.stdOut('pid: '))
      .beforeAndAfter();

    it('should run in clustered mode given not running in debug mode', () => {
      expect(app.stdout().join()).to.not.be.string(`pid: ${app.child().pid}`);
    });
  });
});