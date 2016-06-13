'use strict';
const env = require('./environment'),
  expect = require('chai').expect,
  fetch = require('node-fetch');

describe('app-info', function () {
  this.timeout(10000);
  env.start();

  it('should correctly display app name of this app and not of the source module (wix-app-info or wix-bootstrap)', () =>
    fetch(env.app.getManagementUrl('app-info/about/api')).then(res => {
      expect(res.status).to.equal(200);
      return res.json();
    }).then(json => expect(json).to.have.deep.property('name', 'das-boot'))
  );

  it('should run app-info app in master process', () =>
    fetch(env.app.getManagementUrl('app-info/about/api')).then(res => {
      expect(res.status).to.equal(200);
      return res.json();
    }).then(json => {
      expect(json).to.have.deep.property('workerCount', 2);
    })
  );

});