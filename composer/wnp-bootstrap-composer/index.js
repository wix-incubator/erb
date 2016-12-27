const runMode = require('wix-run-mode'),
  log = require('wnp-debug')('wnp-bootstrap-composer'),
  beforeAll = require('./lib/before-all'),
  newRelic = require('./lib/boot-relic'),
  buildFrom = require('./lib/disabler'),
  shutdown = require('./lib/shutdown'),
  initialContext = require('./lib/context/initial-app-context'),
  resolveFilePath = require('./lib/utils/resolve-file-path'),
  HealthManager = require('./lib/health/manager'),
  _ = require('lodash');

class WixBootstrapComposer {
  constructor(opts) {
    beforeAll(runMode, process.env, log, newRelic);
    const fromOptions = getFromOptions(opts);
    this._healthManager = new HealthManager(setTimeoutFn(fromOptions('health.forceDelay')));
    this._shutdown = shutdown.assembler();
    this._mainHttpAppFns = [];
    this._mainExpressAppFns = [() => require('./lib/health').isAlive(() => this._healthManager.status)];
    this._managementAppFns = [
      context => require('./lib/health').deploymentTest(context, () => this._healthManager.status),
      context => require('./lib/health').stop(context, () => this._shutdown.assemble()())];

    this._plugins = [];
    this._appConfigFn = () => context => Promise.resolve(context);
    this._mainExpressAppComposer = fromOptions('composers.mainExpress', defaultExpressAppComposer);
    this._managementExpressAppComposer = fromOptions('composers.managementExpress', defaultExpressAppComposer);
    this._runner = fromOptions('runner', passThroughRunner);
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
    require('./lib/before-start')(runMode, effectiveEnvironment, log).forEach(el => this._shutdown.addShutdownFn(el.fn, el.name));
    const mainExpressAppComposer = (disabled.find(el => el === 'express')) ? defaultExpressAppComposer : this._mainExpressAppComposer;
    const managementAppComposer = (disabled.find(el => el === 'management')) ? defaultExpressAppComposer : this._managementExpressAppComposer;
    const runner = (disabled.find(el => el === 'runner')) ? passThroughRunner : this._runner;

    let appContext = initialContext(effectiveEnvironment);

    return runner(appContext)(() => {
      const mainHttpServer = asyncHttpServer();
      const managementHttpServer = asyncHttpServer();

      this._shutdown.addHttpServer(mainHttpServer, 'main http server');
      this._shutdown.addHttpServer(managementHttpServer, 'management http server');

      return require('./lib/context/app-context')(appContext, this._shutdown, this._plugins, this._healthManager)
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
        .then(() => log.info('\x1b[33m%s\x1b[0m ', `Host's URL is: http://${appContext.env.HOSTNAME}:${appContext.env.PORT}`))
        .then(() => this._healthManager.start())
        .then(() => this._shutdown.addShutdownFn(() => this._healthManager.stop(), 'health manager'))
        .catch(err => {
          log.error('Failed loading app');
          log.error(err);
          //TODO: best effort in clean-up
          return Promise.reject(err);
        })
        .then(() => this._shutdown.assemble());
    });
  }
}

function buildAppConfig(context, appConfigFn) {
  return Promise.resolve(appConfigFn(context));
}

function composeHttpApp(context, config, appFns) {
  return Promise.resolve()
    .then(() => httpServer => Promise.all(appFns.map(appFn => appFn(context)(httpServer, config))));
}

function composeExpressApp(composer, context, config, appFns) {
  return Promise.all(appFns.map(appFn => appFn(context)(config)))
    .then(apps => composer()(context, apps))
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

function defaultExpressAppComposer() {
  return (context, apps) => Promise.resolve().then(() => {
    const container = aBlankExpressApp();
    apps.forEach(app => container.use(app));
    return container;
  });
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

module.exports.Composer = WixBootstrapComposer;

