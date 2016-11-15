const extractGatekeeperUrl = require('../lib/extract-gatekeeper-url'),
  expect = require('chai').expect;

describe('extracting gatekeeper url from config', function () {

  it('should extract it from prod config', () => {
    const context = {
      env: aProdEnv(),
      config: aConfigLoader()
    };
    return expect(extractGatekeeperUrl(context, true))
      .to.be.equal('from_config_wix-bootstrap-gatekeeper');
  });

  it('should prioritize env vars before prod config', () => {
    const context = {
      env: aGatekeeperUrl(),
      config: aConfigLoader()
    };
    return expect(extractGatekeeperUrl(context, true))
      .to.be.equal('from_env');
  });

  it('should use default value if dev env', () => {
    const context = {
      env: aDevEnv()
    };
    return expect(extractGatekeeperUrl(context, false)).to.be.equal('http://localhost:3029');
  });

  function aProdEnv() {
    return {NODE_ENV: 'production'};
  }

  function aDevEnv() {
    return {NODE_ENV: 'dev'};
  }
  
  function aGatekeeperUrl() {
    return {WIX_BOOT_GATEKEEPER_URL: 'from_env'};
  }
  
  function aConfigLoader() {
    return {load: (configName) => {return {services: {gatekeeper: `from_config_${configName}`}}}};
  }
  
});
