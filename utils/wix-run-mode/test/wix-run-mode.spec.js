const chai = require('chai'),
  expect = chai.expect,
  runMode = require('..');

describe('wix-run-mode', () => {
  const originalEnvKeys = {
    NODE_ENV: process.env.NODE_ENV,
    IS_BUILD_AGENT: process.env.IS_BUILD_AGENT
  };
  
  beforeEach(() => Object.keys(originalEnvKeys).forEach(key => delete process.env[key]));
  afterEach(() => Object.keys(originalEnvKeys).forEach(key => process.env[key] = originalEnvKeys[key]));
  
  describe('isCI', () => {

    it('should return "true" if module detects that app is running in ci (env IS_BUILD_AGENT is present)', () => {
      process.env.IS_BUILD_AGENT = 'true';
      expect(runMode.isCI()).to.equal(true);
    });

    it('should return "false" if module considers app to be executed not in ci (env IS_BUILD_AGENT not present)', () => {
      expect(runMode.isCI()).to.equal(false);
    });

    it('should use environment provided via arg', () => {
      expect(runMode.isCI({IS_BUILD_AGENT: 'true'})).to.equal(true);
    });
  });

  describe('isProduction', () => {

    it('should return "true" if production environment detected (NODE_ENV is set to "production")', () => {
      process.env.NODE_ENV = 'production';
      expect(runMode.isProduction()).to.equal(true);
    });

    it('should return "false" production environment not detected (NODE_ENV is not set to "production")', () => {
      expect(runMode.isProduction()).to.equal(false);
    });

    it('should use environment provided via arg', () => {
      expect(runMode.isProduction({NODE_ENV: 'production'})).to.equal(true);
    });

  });
});
