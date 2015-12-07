'use strict';
const testkit = require('wix-bootstrap-testkit'),
  expect = require('chai').expect,
  request = require('request'),
  envSupport = require('env-support');

describe('app', function () {
  this.timeout(10000);
  const app = testkit.bootstrapApp('./index.js', {env: envSupport.basic()});

  app.beforeAndAfter();

  it('should be available on "/"', done => {
    request.get(app.getUrl('/'), (err, res) => {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });
});