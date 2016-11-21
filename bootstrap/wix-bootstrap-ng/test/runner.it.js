'use strict';
const expect = require('chai').expect,
  testkit = require('./support/testkit'),
  fetch = require('node-fetch');

describe('wnp bootstrap runner', function () {
  this.timeout(10000);
  const app = testkit.app('default').beforeAndAfter();

  it('runs and app using wix-cluster and 2 workers by default', () =>
    fetch(app.managementAppUrl('/app-info/about/api'), {headers: {'accept': 'application/json'}}).then(res => {
      expect(res.status).to.equal(200);
      return res.json();
    }).then(json => expect(json).to.contain.deep.property('workerCount', 1))
  );
});