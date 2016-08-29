'use strict';
const expect = require('chai').expect,
  testkit = require('wix-childprocess-testkit');

describe('runner it', function () {
  this.timeout(5000);

  const app = testkit
    .server('./test/app', {}, testkit.checks.stdOut('pid: '))
    .beforeAndAfter();

  it('should run in clustered mode by default', () => {
    expect(app.stdout().join()).to.not.be.string(`pid: ${app.child().pid}`);
  });
});