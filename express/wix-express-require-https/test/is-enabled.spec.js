const {expect} = require('chai'),
  {isEnabled, ENV_VARIABLE_ENABLE} = require('../lib/is-enabled');

describe('isEnabled', () => {

  it('should be enabled for production environment', () => {
    expect(isEnabled({NODE_ENV: 'production'})).to.equal(true);
  });

  it('should be enabled if environment variable is set', () => {
    const env = {};
    env[ENV_VARIABLE_ENABLE] = 'true';
    expect(isEnabled(env)).to.equal(true);
  });

  it('should be disabled for non-production environemnt', () => {
    expect(isEnabled({})).to.equal(false);
  });
});
