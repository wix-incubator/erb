'use strict';
const testkit = require('wix-bootstrap-testkit'),
  expect = require('chai').expect,
  fetch = require('node-fetch');

describe('app-info', function () {
  this.timeout(10000);

  const app = testkit.bootstrapApp('./index.js', {env: {APP_CONF_DIR: './test/configs'}});

  app.beforeAndAfter();

  it('should correctly display app name and version in app-info', () =>
    fetch(app.getManagementUrl('app-info'), {
      headers: {
        Accept: 'application/json'
      }
    }).then(res => {
      expect(res.status).to.equal(200);
      return res.json();
    }).then(json => {
      expect(json).to.have.deep.property('name', 'das-boot');
      expect(json).to.have.deep.property('version', '1.0.0');
    })
  );

  it('should run app-info app in master process', () =>
    fetch(app.getManagementUrl('app-info'), {
      headers: {
        Accept: 'application/json'
      }
    }).then(res => {
      expect(res.status).to.equal(200);
      return res.json();
    }).then(json => {
      expect(json).to.have.deep.property('processCount', 3);
    })
  );

});