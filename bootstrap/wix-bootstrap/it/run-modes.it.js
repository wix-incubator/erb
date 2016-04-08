'use strict';
const expect = require('chai').expect,
  req = require('./support/req'),
  testkit = require('wix-childprocess-testkit'),
  envSupport = require('env-support'),
  exec = require('child_process').execSync;

describe('bootstrap run modes', function () {
  this.timeout(60000);

  describe('dev mode', () => {
    const env = envSupport.bootstrap({PORT: 3110, MANAGEMENT_PORT: 3114, NODE_ENV: 'some'});
    const app = testkit.server('it/apps/run-modes/index', {env}, testkit.checks.httpGet('/health/is_alive'));
    app.beforeAndAfter();

    it('should use defaults for missing required env variables', () =>
      req.get('http://localhost:3110/env').then(res => {
        expect(res.status).to.equal(200);
        expect(res.json()).to.contain.deep.property('MANAGEMENT_PORT', '3114');
      })
    );
  });

  describe('production mode', () => {
    it('should fail to start app on missing required env variables', () =>
      expect(() => exec('node ./it/apps/run-modes/index.js', {env: {NODE_ENV: 'production'}}))
        .to.throw(Error, 'Mandatory env variable \'PORT\' is missing.')
    );
  });
});
