const expect = require('chai').expect,
  testkit = require('wix-childprocess-testkit');

describe('runner it', function () {
  this.timeout(5000);

  const app = testkit
    .fork('./test/app', {}, testkit.checks.stdErrOut('pid: '))
    .beforeAndAfter();

  it('should run in clustered mode by default', () => {
    expect(app.output).to.not.be.string(`pid: ${app.child.pid}`);
  });
});
