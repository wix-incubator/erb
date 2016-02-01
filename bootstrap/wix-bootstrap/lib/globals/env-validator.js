'use strict';
module.exports.setup = env => {
  ['PORT', 'MANAGEMENT_PORT', 'APP_CONF_DIR'].forEach(envKey => {
    if (!env[envKey]) {
      throw new Error(`Mandatory env variable '${envKey}' is missing.`);
    }
  });
};