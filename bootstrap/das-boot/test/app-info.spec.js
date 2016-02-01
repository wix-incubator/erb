'use strict';
const testkit = require('wix-bootstrap-testkit'),
  expect = require('chai').expect,
  fetch = require('node-fetch');

describe('app-info', function () {
  this.timeout(10000);

  const app = testkit.server('./index').beforeAndAfter();

  it('should correctly display app name of this app and not of the source module (wix-app-info or wix-bootstrap)', () =>
    fetch(app.getManagementUrl('app-info'), opts()).then(res => {
      expect(res.status).to.equal(200);
      return res.json();
    }).then(json => expect(json).to.have.deep.property('name', 'das-boot'))
  );

  it('should run app-info app in master process', () =>
    fetch(app.getManagementUrl('app-info'), opts()).then(res => {
      expect(res.status).to.equal(200);
      return res.json();
    }).then(json => {
      expect(json).to.have.deep.property('processCount', 3);
    })
  );

  function opts() {
    return {
      headers: {
        Accept: 'application/json'
      }
    };
  }

});