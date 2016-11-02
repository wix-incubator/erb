'use strict';
const join = require('path').join,
  artifactVersion = require('./artifact-version'),
  WixMeasured = require('wix-measured');

module.exports = buildAppContext;

function buildAppContext(env) {
  const appName = require(join(process.cwd(), 'package.json')).name;
  const appVersion = artifactVersion(process.cwd());
  return {
    env: env,
    app: {
      name: appName,
      version: appVersion
    },
    metrics: new WixMeasured({
      app_name: appName,
      app_host: env.HOSTNAME
    }).collection({process: 'worker'})
  };
}