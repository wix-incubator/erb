'use strict';
const testkit = require('..'),
  expect = require('chai').expect,
  http = require('wnp-http-test-client'),
  stdoutErr = require('wix-stdouterr-testkit');

describe('bootstrap testkit debug support', function () {
  this.timeout(30000);
  let app;
  const interceptor = stdoutErr.interceptor().beforeAndAfterEach();
  const argv = process.execArgv;

  beforeEach(() => process.execArgv = argv);
  afterEach(() => {
    process.execArgv = argv;
    return app.stop();
  });

  it('should run app in clustered mode by default', () => {
    app = testkit.server('./test/app/index');
    return app.start()
      .then(() => http.okGet(app.getUrl('/pid')))
      .then(res => expect(res.text()).to.not.equal(`${process.pid}`))
  });

  it('should run app in embedded mode if node is executed in debug mode', () => {
    process.execArgv.push('--debug');
    app = testkit.server('./test/app/index');
    return app.start()
      .then(() => http.okGet(app.getUrl('/pid')))
      .then(res => expect(res.text()).to.equal(`${process.pid}`))
      .then(() => expect(interceptor.output).to.be.string('WARNING: app is running in debug mode'))
  });

  it('should not run app in embedded mode if node is executed in debug mode but disableDebug option set to true', () => {
    process.execArgv.push('--debug');
    app = testkit.server('./test/app/index', {disableDebug: true});
    return app.start()
      .then(() => http.okGet(app.getUrl('/pid')))
      .then(res => expect(res.text()).to.not.equal(`${process.pid}`))
      .then(() => expect(interceptor.output).to.not.be.string('WARNING: app is running in debug mode'))
  });

});