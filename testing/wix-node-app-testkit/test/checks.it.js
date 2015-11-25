'use strict';
const _ = require('lodash'),
  request = require('request'),
  testkit = require('..');

const env = {
  PORT: 3000,
  MOUNT_POINT: '/app'
};

describe('http', function () {
  this.timeout(10000);
  let app;

  afterEach(done => app.stop(done));

  [
    {name: 'HttpCheck', app: 'app-checks-http', check: testkit.checks.http({method: 'post', uri: 'http://localhost:3000/app'},
      (err, res, body) => (_.isNull(err) && (res && res.statusCode >= 200 && res.statusCode < 300)))},
    {name: 'HttpGetCheck', app: 'app-checks-http', check: testkit.checks.httpGet('/')},
    {name: 'StdErrCheck', app: 'app-checks-stderrout', check: testkit.checks.stdErr('logged stderr check')},
    {name: 'StdOutCheck', app: 'app-checks-stderrout', check: testkit.checks.stdOut('logged stdout check')}
  ].forEach(tcase => {

      it(tcase.name, done => {
        app = anApp(tcase.app, tcase.check);
        app.start(done);
      });
  });

  function anApp(app, check) {
    return testkit.embeddedApp(`./test/apps/${app}.js`, {env}, check);
  }
});
