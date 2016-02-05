'use strict';
const _ = require('lodash'),
  request = require('request'),
  testkit = require('..'),
  envSupport = require('env-support');

describe('checks it', function () {
  this.timeout(10000);
  let app, env;

  beforeEach(() => env = envSupport.basic());

  afterEach(() => {
    if (app.isRunning) {
      return app.stop();
    }
  });

  [
    testCase('HttpPostCheck', 'app-checks-http', env => testkit.checks.http({
      method: 'post',
      uri: `http://localhost:${env.PORT}${env.MOUNT_POINT}`
    },
    (err, res, body) => (_.isNull(err) && (res && res.statusCode >= 200 && res.statusCode < 300)))),
    testCase('HttpGetCheck', 'app-checks-http', () => testkit.checks.httpGet('/')),
    testCase('StdErrCheck', 'app-checks-stderrout', () => testkit.checks.stdErr('logged stderr check')),
    testCase('StdOutCheck', 'app-checks-stderrout', () => testkit.checks.stdOut('logged stdout check'))
  ].forEach(tcase => {

    it(tcase.name, () => {
      app = testkit.server(`./test/apps/${tcase.app}`, {env}, tcase.check(env));
      return app.start();
    });
  });

  function testCase(name, app, check) {
    return {name, app, check};
  }
});
