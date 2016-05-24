'use strict';
const expect = require('chai').expect,
  envValidator = require('../../lib/before-start/env-validator');

describe('env-validator', () => {
  let env;

  beforeEach(() => env = valid());

  ['PORT', 'MANAGEMENT_PORT', 'APP_CONF_DIR', 'MOUNT_POINT', 'APP_TEMPL_DIR', 'APP_LOG_DIR', 'HOSTNAME'].forEach(envKey => {
    it(`should validate presence of ${envKey} in process.env`, () => {
      env[envKey] = undefined;
      expect(() => envValidator(env)).to.throw(Error, `Mandatory env variable '${envKey}' is missing.`);
    });
  });

  function valid() {
    return {
      PORT: 1,
      MANAGEMENT_PORT: 3004,
      MOUNT_POINT: '/qwe',
      APP_CONF_DIR: '/qweqwe',
      APP_TEMPL_DIR: '/qweqweqwe',
      APP_LOG_DIR: '/qweqweqweqwe',
      HOSTNAME: 'localhost'
    };
  }
});