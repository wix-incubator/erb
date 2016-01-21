'use strict';
const expect = require('chai').expect,
  env = require('./support/environment'),
  req = require('./support/req'),
  packageJson = require('../package.json');

describe('wix bootstrap app-info', function () {
  this.timeout(60000);
  env.start();

  it('should serve app-info on "/app-info"', () =>
    req.get(env.managementAppUrl('/app-info')).then(res => {
      expect(res.status).to.equal(200);
      expect(res.json()).to.have.deep.property('name', 'wix-bootstrap');
      expect(res.json()).to.have.deep.property('version', packageJson.version);
    })
  );

  it('should serve app-info html views on "/app-info"', () =>
    req.get(env.managementAppUrl('/app-info'), {
      headers: {
        Accept: '*/html'
      }
    }).then(res => {
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('<td>Name</td>');
      expect(res.text).to.contain('<td>wix-bootstrap</td>');
      expect(res.text).to.contain('<td>Version</td>');
      expect(res.text).to.contain(`<td>${packageJson.version}</td>`);
    })
  );

  it('should serve minimal app data for monitoring on "/app-info/app-data"', () =>
    req.get(env.managementAppUrl('/app-info/app-data')).then(res => {
      expect(res.status).to.equal(200);
    })
  );
});