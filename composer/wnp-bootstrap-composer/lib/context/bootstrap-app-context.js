const join = require('path').join,
  artifactVersion = require('../utils/artifact-version'),
  WixMeasured = require('wix-measured'),
  lazyNewRelic = require('../utils/lazy-newrelic'),
  WixConfig = require('wix-config'),
  bootstrapSession = require('wnp-bootstrap-session'),
  bootstrapStatsD = require('wnp-bootstrap-statsd'),
  bootstrapRpc = require('wnp-bootstrap-rpc');

module.exports = buildAppContext;

function buildAppContext({env, log, shutdownAssembler, healthManager, composerOptions}) {
  const appName = require(join(process.cwd(), 'package.json')).name;
  const appVersion = artifactVersion(process.cwd(), log);
  const measuredFactory = new WixMeasured(env.HOSTNAME, appName);
  const measuredClient = measuredFactory.collection('tag', 'METER');
  const config = new WixConfig(env.APP_CONF_DIR);
  const addHealthTest = (name, fn) => healthManager.add(name, fn);
  const addShutdownHook = (name, fn) => shutdownAssembler.addFunction(name, fn);
  const newrelic = lazyNewRelic();
  const session = bootstrapSession({env, config, log});
  const statsd = bootstrapStatsD({env, config, log, measuredFactory, shutdownAssembler});
  const rpc = bootstrapRpc({env, config, timeout: composerOptions('rpc.timeout'), 
    log, hostname: env.HOSTNAME, artifactName: appName});

  return {
    env: env,
    newrelic,
    config,
    session,
    statsd,
    rpc,
    app: {
      name: appName,
      version: appVersion
    },
    metrics: {
      factory: measuredFactory,
      client: measuredClient
    },
    
    management: {
      addHealthTest: addHealthTest,
      addShutdownHook: addShutdownHook
    }
  };
}