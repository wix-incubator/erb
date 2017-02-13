const runMode = require('wix-run-mode'),
  log = require('wnp-debug')('wnp-bootstrap-composer'),
  buildFrom = require('./disabler'),
  shutdown = require('./shutdown'),
  bootstrapAppContext = require('./context/bootstrap-app-context'),
  resolveFilePath = require('./utils/resolve-file-path'),
  HealthManager = require('./health/manager'),
  _ = require('lodash'),
  health = require('./health'),
  beforeStart = require('./before-start'),
  buildAppContext = require('./context/inject-modules'),
  bootstrapExpress = require('wnp-bootstrap-express'),
  bootstrapManagement = require('wnp-bootstrap-management'),
  defaults = require('./defaults');

module.exports = class InnerComposer {
  constructor(opts) {
    this._fromOptions = getFromOptions(opts);
    this._healthManager = new HealthManager(setTimeoutFn(this._fromOptions('health.forceDelay')));
    this._shutdown = new shutdown.Assembler(log);
    this._mainHttpAppFns = [];
    this._mainExpressAppFns = [() => health.isAlive(() => this._healthManager.status())];
    this._managementAppFns = [
      context => health.deploymentTest(context, () => this._healthManager.status()),
      context => health.stop(context, () => this._shutdown.emit()())
    ];

    this._plugins = [];
    this._appConfigFn = () => context => Promise.resolve(context);
    this._runner = this._fromOptions('runner', passThroughRunner);
  }

  config(appConfigFnFile) {
    this._appConfigFn = buildRequireFunction(appConfigFnFile);
    return this;
  }

  use(plugin, opts) {
    this._plugins.push({plugin: plugin, opts: opts || {}});
    return this;
  }

  express(expressFnFile) {
    this._mainExpressAppFns.push(buildRequireFunction(expressFnFile));
    return this;
  }

  management(expressFnFile) {
    this._managementAppFns.push(buildRequireFunction(expressFnFile));
    return this;
  }

  http(httpFnFile) {
    this._mainHttpAppFns.push(buildRequireFunction(httpFnFile));
    return this;
  }

  start(opts) {
    const options = opts || {};
    const effectiveEnvironment = Object.assign({}, process.env, options.env);
    const disabled = buildFrom(effectiveEnvironment, options.disable);
    beforeStart(runMode, effectiveEnvironment, log).forEach(el => this._shutdown.addFunction(el.name, el.fn));
    const runner = (disabled.find(el => el === 'runner')) ? passThroughRunner : this._runner;

    let appContext = bootstrapAppContext({
      log,
      env: effectiveEnvironment,
      shutdownAssembler: this._shutdown,
      healthManager: this._healthManager,
      composerOptions: this._fromOptions
    });

    const mainExpressAppComposer = bootstrapExpress({
      env: appContext.env,
      config: appContext.config,
      session: appContext.session,
      newrelic: appContext.newrelic,
      timeout: this._fromOptions('express.timeout', defaults.expressTimeout),
      log
    });

    const managementAppComposer = bootstrapManagement({
      appName: appContext.app.name,
      appVersion: appContext.app.version,
      persistentDir: appContext.env.APP_PERSISTENT_DIR
    });

    return runner(appContext)(() => {
      const mainHttpServer = asyncHttpServer();
      const managementHttpServer = asyncHttpServer();

      this._shutdown.addHttpServer('main http server', mainHttpServer);
      this._shutdown.addHttpServer('management http server', managementHttpServer);

      return buildAppContext({appContext, plugins: this._plugins, log})
        .then(context => appContext = context)
        .then(() => buildAppConfig(appContext, this._appConfigFn()))
        .then(appConfig => {
          const mainApps = [
            () => composeExpressApp(mainExpressAppComposer, appContext, appConfig, this._mainExpressAppFns),
            () => composeHttpApp(appContext, appConfig, this._mainHttpAppFns)];
          const managementApps = [() => composeExpressApp(managementAppComposer, appContext, appConfig, this._managementAppFns)];

          return Promise.all([
            attachAndStart(mainHttpServer, appContext.env.PORT, mainApps),
            attachAndStart(managementHttpServer, appContext.env.MANAGEMENT_PORT, managementApps)
          ]);
        })
        .then(() => this._healthManager.start())
        .then(() => this._shutdown.addFunction('health manager', () => this._healthManager.stop()))
        .then(() => log.info('\x1b[33m%s\x1b[0m ', `Host's URL is: http://${appContext.env.HOSTNAME}:${appContext.env.PORT}`))
        .catch(err => {
          log.error('Failed loading app');
          log.error(err);
          //TODO: best effort in clean-up
          return Promise.reject(err);
        })
        .then(() => this._shutdown.emit());
    });
  }
};

function buildAppConfig(context, appConfigFn) {
  return Promise.resolve(appConfigFn(context));
}

function composeHttpApp(context, config, appFns) {
  return Promise.resolve()
    .then(() => httpServer => Promise.all(appFns.map(appFn => appFn(context)(httpServer, config))));
}

function composeExpressApp(composer, context, config, appFns) {
  return Promise.all(appFns.map(appFn => {
    const withContext = appFn(context);
    if (withContext.length === 2) {
      return expressApp => withContext(expressApp, config);
    } else {
      return () => withContext(config);
    }
  }))
    .then(contextualizedAppFns => composer(contextualizedAppFns))
    .then(composed => httpServer => {
      const app = aBlankExpressApp()
        .use(context.env.MOUNT_POINT, composed);
      httpServer.on('request', app)
    });
}

function attachAndStart(httpServer, port, composerFns) {
  return Promise.all(composerFns.map(composer => composer()))
    .then(composers => Promise.all(composers.map(composer => composer(httpServer))))
    .then(() => httpServer.listenAsync(port))
    .then(() => log.info(`Listening on ${port}`));
}

function asyncHttpServer() {
  return require('bluebird').promisifyAll(require('http').createServer());
}

function passThroughRunner() {
  return thenable => thenable();
}

function aBlankExpressApp() {
  return require('express')().disable('x-powered-by');
}

function buildRequireFunction(filePath) {
  return () => require(resolveFilePath(process.cwd(), filePath))
}

function getFromOptions(opts) {
  return (key, fallback) => _.get(opts, key, fallback);
}

function setTimeoutFn(maybeForceDelay) {
  if (maybeForceDelay) {

    return fn => setTimeout(fn, maybeForceDelay);
  } else {
    return setTimeout;
  }
}
