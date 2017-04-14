const appInfo = require('../lib/app-info'),
  expect = require('chai').expect;

describe('app info', () => {

  it('should fail creating appInfo instance without "profilingResourcesDir" provided', () => {
    expect(() => appInfo()).to.throw('Profiling resources directory must be provided, set [profilingResourcesDir] option')
  });

});
