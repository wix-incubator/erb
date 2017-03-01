const join = require('path').join,
  artifactVersion = require('../utils/artifact-version'),
  lazyNewRelic = require('../utils/lazy-newrelic'),
  WixConfig = require('wix-config'),
  WixMeasured = require('wix-measured'),
  bootstrapSession = require('wnp-bootstrap-session'),
  bootstrapStatsD = require('wnp-bootstrap-statsd'),
  bootstrapRpc = require('wnp-bootstrap-rpc'),
  bootstrapPetri = require('wnp-bootstrap-petri'),
  HealthManager = require('../health/manager'),
  ShutdownAssembler = require('../shutdown').Assembler;

module.exports = buildAppContext;

function buildAppContext({env, log, petriSpecsComposer, composerOptions}) {
  const appName = require(join(process.cwd(), 'package.json')).name;
  const appVersion = artifactVersion(process.cwd(), log);
  const measuredFactory = new WixMeasured(env.HOSTNAME, appName);
  const measuredClient = measuredFactory.collection('tag', 'METER');
  const measuredInfraClient = measuredFactory.collection('tag', 'INFRA');
  const config = new WixConfig(env.APP_CONF_DIR);
  const newrelic = lazyNewRelic();
  const session = bootstrapSession({env, config, log});
  const shutdownAssembler = new ShutdownAssembler(log);
  const statsd = bootstrapStatsD({env, config, log, measuredFactory, shutdownAssembler});
  const rpcFactory = bootstrapRpc({
    env, config, timeout: composerOptions('rpc.timeout'),
    log, hostname: env.HOSTNAME, artifactName: appName
  });
  const petriClient = bootstrapPetri({env, config, log, rpcFactory});
  const healthManager = new HealthManager({
    metricsClient: measuredInfraClient,
    setTimeoutOverride: setTimeoutFn(composerOptions('health.forceDelay'))
  });
  const petriSpecsManager = petriSpecsComposer.createManager({env, config, log, rpcFactory});

  const appContext = {
    env: env,
    newrelic,
    config,
    session,
    rpc: rpcFactory,
    statsd,
    petri: {
      client: aspects => petriClient.client(aspects),
      addSpecs: specs => petriSpecsManager.addSpecs(specs)
    },
    app: {
      name: appName,
      version: appVersion
    },
    metrics: {
      factory: measuredFactory,
      client: measuredClient
    },
    management: {
      addHealthTest: (name, fn) => healthManager.add(name, fn),
      addShutdownHook: (name, fn) => shutdownAssembler.addFunction(name, fn)
    },
  };

  return {healthManager, shutdownAssembler, appContext};

}

//TODO: move to item itself
function setTimeoutFn(maybeForceDelay) {
  if (maybeForceDelay) {

    return fn => setTimeout(fn, maybeForceDelay);
  } else {
    return setTimeout;
  }
}
