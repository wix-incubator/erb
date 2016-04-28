'use strict';
const join = require('path').join,
  Promise = require('bluebird');

module.exports = buildAppContext;

function buildAppContext(plugins) {
  const packageJson = require(join(process.cwd(), 'package.json'));
  const current = {
    env: {
      port: process.env.PORT,
      managementPort: process.env.MANAGEMENT_PORT,
      mountPoint: process.env.MOUNT_POINT,
      logDir: process.env.APP_LOG_DIR,
      confDir: process.env.APP_CONF_DIR,
      templDir: process.env.APP_TEMPL_DIR,
      hostname: process.env.HOSTNAME
    },
    app: {
      name: packageJson.name,
      version: packageJson.version
    },
    newrelic: require('newrelic')
  };

  //TODO: verify that module contains di, key, value
  return Promise
    .each(plugins, plugin => {
      return Promise.resolve()
        .then(() => plugin.plugin.di.value(current, plugin.opts))
        .then(value => current[plugin.plugin.di.key] = value)
    })
    .then(() => current);
}