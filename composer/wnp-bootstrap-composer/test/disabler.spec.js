const expect = require('chai').expect,
  disabler = require('../lib/disabler');

describe('disabler', () => {

  it('should return empty array if environment variable is missing and disabled module array is undefined', () => {
    expect(disabler({})).to.deep.equal([]);
  });

  it('should return empty array if environment variable is missing and disabled module array is empty', () => {
    expect(disabler({}, [])).to.deep.equal([]);
  });

  it('should return array with a single value from environment', () => {
    expect(disabler({WIX_BOOT_DISABLE_MODULES: 'runner'})).to.deep.equal(['runner']);
  });

  it('should return array with multiple values from environment', () => {
    expect(disabler({WIX_BOOT_DISABLE_MODULES: 'runner, express'})).to.deep.equal(['express', 'runner']);
  });

  it('should return array with multiple values from environment', () => {
    expect(disabler({WIX_BOOT_DISABLE_MODULES: 'runner, express'})).to.deep.equal(['express', 'runner']);
  });

  it('should return array passed via disables', () => {
    expect(disabler({}, ['runner', 'express'])).to.deep.equal(['express', 'runner']);
  });

  it('should return joint list from disables and env variable', () => {
    expect(disabler({WIX_BOOT_DISABLE_MODULES: 'runner'}, ['express'])).to.deep.equal(['express', 'runner']);
  });

});
