'use strict';
const testkit = require('..'),
  envSupport = require('env-support');

describe('checks it', function () {
  this.timeout(10000);
  let app, env;

  beforeEach(() => env = envSupport.basic());
  afterEach(() => app.isRunning && app.stop());
  
  [
    testCase('HttpPostCheck', 'app-checks-http', env => testkit.checks.http(
      `http://localhost:${env.PORT}${env.MOUNT_POINT}`, {method: 'post'})),
    testCase('HttpGetCheck', 'app-checks-http', () => testkit.checks.httpGet('/')),
    testCase('StdErrOutCheck with stderr', 'app-checks-stderrout', () => testkit.checks.stdErrOut('logged stderr check')),
    testCase('StdErrOutCheck with stdout', 'app-checks-stderrout', () => testkit.checks.stdErrOut('logged stdout check'))
  ].forEach(tcase => {

    it(tcase.name, () => {
      app = testkit.fork(`./test/apps/${tcase.app}`, {env}, tcase.check(env));
      return app.start();
    });
  });

  function testCase(name, app, check) {
    return {name, app, check};
  }
});
