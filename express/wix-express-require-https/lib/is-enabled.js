const runMode = require('wix-run-mode');

const ENV_VARIABLE_ENABLE = 'WIX_ENABLE_REQUIRE_HTTPS';

function isEnabled(effectiveEnv = process.env) {
  return !!(runMode.isProduction(effectiveEnv) || effectiveEnv[ENV_VARIABLE_ENABLE]);
}

module.exports = {
  ENV_VARIABLE_ENABLE, 
  isEnabled};
