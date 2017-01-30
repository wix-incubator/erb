const join = require('path').join,
  artifactVersion = require('./artifact-version'),
  WixMeasured = require('wix-measured');

module.exports = buildAppContext;

function buildAppContext(env) {
  const appName = require(join(process.cwd(), 'package.json')).name;
  const appVersion = artifactVersion(process.cwd());
  const measuredFactory = new WixMeasured(env.HOSTNAME, appName);
  return {
    env: env,
    app: {
      name: appName,
      version: appVersion
    },
    metrics: {
      factory: measuredFactory,
      client: measuredFactory.collection('tag', 'METER')
      
    }
  };
}
