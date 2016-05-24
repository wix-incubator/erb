'use strict';
const runMode = require('wix-run-mode'),
  log = require('wnp-debug')('wnp-bootstrap-express');

const configName = 'wnp-bootstrap-express';

module.exports.configName = configName;

module.exports = opts => (context, apps) => {
  const effectiveOptions = defaults(opts && opts.timeout);

  if (runMode.isProduction() && context.env['WIX-BOOT-EXPRESS-SEEN-BY']) {
    log.debug(`production mode detected, env variable 'WIX-BOOT-EXPRESS-SEEN-BY' set, skipping loading from config.`);
    effectiveOptions.seenBy = context.env['WIX-BOOT-EXPRESS-SEEN-BY'];
  } else if (runMode.isProduction()) {
    log.debug(`production mode detected, loading seen-by from config: ${context.env.APP_CONF_DIR}/${configName}.json.erb`);
    effectiveOptions.seenBy = context.config.load(configName).requestContext.seenBy;
  } else {
    log.debug(`dev mode detected, using seen-by: '${effectiveOptions.seenBy}'`);
  }

  return require('./lib/wnp-bootstrap-express')(effectiveOptions)(context, apps);
};

function defaults(timeout) {
  return {
    timeout: timeout || 10000,
    seenBy: 'seen-by-dev'
  }
}