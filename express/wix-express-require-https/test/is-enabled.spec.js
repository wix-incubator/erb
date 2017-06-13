const {expect} = require('chai'),
  {isEnabled, ENV_VARIABLE_ENABLE} = require('../lib/is-enabled');

describe('isEnabled', () => {

  it('should be enabled for production environment', () => {
    expect(isEnabled({NODE_ENV: 'production'})).to.equal(true);
  });

  it('should be enabled if environment variable is set', () => {
    const env = {[ENV_VARIABLE_ENABLE]: 'true'};
    expect(isEnabled(env)).to.equal(true);
  });

  it('should be disabled for non-production environment', () => {
    expect(isEnabled({})).to.equal(false);
  });

  it('should be disabled when environment variable is set to other than true', () => {
    let env = {[ENV_VARIABLE_ENABLE]: 'false'};
    expect(isEnabled(env)).to.equal(false);
  });

});
