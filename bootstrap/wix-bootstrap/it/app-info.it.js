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

  it('should serve cluster stats on "/app-info"', () =>
    req.get(env.managementAppUrl('/app-info')).then(res => {
      expect(res.status).to.equal(200);
      expect(res.json()).to.have.deep.property('workerDeathCount', 0);
      expect(res.json()).to.have.deep.property('processCount', 3);
      expect(res.json()).to.have.deep.property('memoryRss').and.to.be.string('MB');
      expect(res.json()).to.have.deep.property('memoryHeapTotal').and.to.be.string('MB');
      expect(res.json()).to.have.deep.property('memoryHeapUsed').and.to.be.string('MB');
    })
  );


  it('should run app-info on cluster master', () =>
    req.get(env.managementAppUrl('/app-info')).then(res => {
      expect(res.status).to.equal(200);
      expect(res.json()).to.have.deep.property('processCount', 3);
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
});