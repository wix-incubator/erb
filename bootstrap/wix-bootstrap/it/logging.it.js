'use strict';
const chai = require('chai'),
  expect = chai.expect,
  env = require('./support/environment'),
  req = require('./support/req');

chai.use(require('chai-things'));

describe('wix bootstrap logging', function () {
  this.timeout(60000);
  env.start();

  it('should log via cluster', () =>
    req.get(env.appUrl('/log-info'))
      .then(res => expect(res.status).to.equal(200))
      .then(() => delay(500))
      .then(() => expect(env.app.stdout()).to.include.an.item.that.has.string('INFO category=[app] from request'))
  );

  function delay(ms) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
  }
});


