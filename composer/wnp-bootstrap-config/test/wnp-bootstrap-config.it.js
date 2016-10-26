'use strict';
const expect = require('chai').expect,
  testkit = require('wnp-bootstrap-composer-testkit'),
  http = require('wnp-http-test-client');

describe('bootstrap config', function() {
  this.timeout(10000);
  const app = testkit
    .server('./test/app', {env: {APP_CONF_DIR: './test/app/configs'}})
    .beforeAndAfter();

  it('should return an instance of config loader bound to provided config directory', () =>
    http.okGet(app.getUrl('/'))
      .then(res => expect(res.json()).to.deep.equal({key: 'value'}))
  );
});