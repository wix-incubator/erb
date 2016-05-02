'use strict';
module.exports.setup = env => {
  ['PORT', 'MANAGEMENT_PORT', 'APP_CONF_DIR', 'MOUNT_POINT', 'APP_TEMPL_DIR', 'APP_LOG_DIR'].forEach(envKey => {
    if (env[envKey] === undefined) {
      throw new Error(`Mandatory env variable '${envKey}' is missing.`);
    }
  });
};