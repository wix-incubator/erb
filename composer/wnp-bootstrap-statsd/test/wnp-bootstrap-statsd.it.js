const sinon = require('sinon'),
  expect = require('chai').use(require('sinon-chai')).expect,
  Logger = require('wnp-debug').Logger,
  bootstrapStatsd = require('..'),
  emitter = require('wix-config-emitter'),
  shelljs = require('shelljs'),
  WixConfig = require('wix-config'),
  WixMeasuredFactory = require('wix-measured'),
  statsDTestkit = require('wix-statsd-testkit'),
  eventually = require('wix-eventually');

describe('bootstrap statsd', function () {
  const env = {NODE_ENV: 'production', APP_CONF_DIR: './target/configs', 'WIX_BOOT_STATSD_INTERVAL': 10};
  const statsd = statsDTestkit.server().beforeAndAfterEach();

  before(() => shelljs.rm('-rf', env.APP_CONF_DIR));

  it('fails in production if configuration file is not present', () => {
    const {configureStatsd} = statsdConfigurerWithCollaborators();

    expect(() => configureStatsd(env)).to.throw('no such file or directory');
  });

  it('sends metrics from provided metrics factory using production configuration', () => {
    const configOverride = new WixConfig(env.APP_CONF_DIR);
    const measuredOverride = new WixMeasuredFactory('local', 'an-app');
    const {measuredFactory, configureStatsd} = statsdConfigurerWithCollaborators({configOverride, measuredOverride});

    return emitConfigsWith(env).then(() => {
      configureStatsd(env);
      measuredFactory.collection('aName', 'aValue').meter('aMeter')(10);

      return eventually(() => expect(statsd.events()).to.not.be.empty);
    });
  });

  function emitConfigsWith(env) {
    return emitter({sourceFolders: ['./templates'], targetFolder: env.APP_CONF_DIR})
      .val('statsd_host', 'localhost')
      .emit();
  }

  function statsdConfigurerWithCollaborators({configOverride, measuredOverride} = {}) {
    const config = configOverride || new WixConfig('.');
    const log = sinon.createStubInstance(Logger);
    const shutdownAssembler = {addFunction: sinon.spy()};
    const measuredFactory = measuredOverride || sinon.createStubInstance(WixMeasuredFactory);

    const configureStatsd = (env = {}) => bootstrapStatsd(
      {env, config, log, measuredFactory, shutdownAssembler});

    return {config, log, configureStatsd, measuredFactory, shutdownAssembler};
  }
});
