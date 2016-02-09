'use strict';
const expect = require('chai').expect,
  envValidator = require('../lib/globals/env-validator');

describe('env-validator', () => {
  let env;

  beforeEach(() => env = valid());

  ['PORT', 'MANAGEMENT_PORT', 'APP_CONF_DIR'].forEach(envKey => {
    it(`should validate presence of ${envKey} in process.env`, () => {
      env[envKey] = undefined;
      expect(() => envValidator.setup(env)).to.throw(Error, `Mandatory env variable '${envKey}' is missing.`);
    });
  });

  function valid() {
    return {
      PORT: 1,
      MANAGEMENT_PORT: 3004,
      MOUNT_POINT: '/qwe',
      APP_CONF_DIR: '/qweqwe',
      NEW_RELIC_ENABLED: 3,
      NEW_RELIC_NO_CONFIG_FILE: 4,
      NEW_RELIC_LOG: 'qweqwe'
    };
  }
});