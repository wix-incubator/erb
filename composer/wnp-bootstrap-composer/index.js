'use strict';
const join = require('path').join,
  runMode = require('wix-run-mode'),
  log = require('wnp-debug')('wnp-bootstrap-composer'),
  beforeAll = require('./lib/before-all');

class WixBootstrapComposer {
  constructor(opts) {
    beforeAll(runMode, process.env, log);

    this._mainExpressAppFns = [require('./lib/health').isAlive];
    this._mainHttpAppFns = [];
    this._managementAppFns = [require('./lib/health').deploymentTest];

    this._plugins = [];
    this._appConfigFn = () => Promise.resolve({});
    this._mainExpressAppComposer = (opts && opts.composers && opts.composers.mainExpress) ? opts.composers.mainExpress : defaultExpressAppComposer;
    this._managementExpressAppComposer = (opts && opts.composers && opts.composers.managementExpress) ? opts.composers.managementExpress : defaultExpressAppComposer;
    this._runner = (opts && opts.runner) ? opts.runner : defaultRunner;
  }

  config(appConfigFnFile) {
    this._appConfigFn = require(join(process.cwd(), appConfigFnFile));
    return this;
  }

  use(plugin, opts) {
    this._plugins.push({plugin: plugin, opts: opts || {}});
    return this;
  }

  express(expressFnFile) {
    this._mainExpressAppFns.push(() => require(join(process.cwd(), expressFnFile)));
    return this;
  }

  management(expressFnFile) {
    this._managementAppFns.push(() => require(join(process.cwd(), expressFnFile)));
    return this;
  }

  http(httpFnFile) {
    this._mainHttpAppFns.push(() => require(join(process.cwd(), httpFnFile)));
    return this;
  }

  start() {
    require('./lib/before-start').setup();
    let appContext;

    return this._runner()(() => {
        const mainHttpServer = asyncHttpServer();
        const managementHttpServer = asyncHttpServer();

        return require('./lib/app-context')(this._plugins)
          .then(context => appContext = context)
          .then(() => buildAppConfig(appContext, this._appConfigFn))
          .then(appConfig => {
            const mainApps = [
              () => composeExpressApp(this._mainExpressAppComposer, appContext, appConfig, this._mainExpressAppFns),
              () => composeHttpApp(appContext, appConfig, this._mainHttpAppFns)];
            const managementApps = [() => composeExpressApp(this._managementExpressAppComposer, appContext, appConfig, this._managementAppFns)];

            return Promise.all([
              attachAndStart(mainHttpServer, appContext.env.port, mainApps),
              attachAndStart(managementHttpServer, appContext.env.managementPort, managementApps)
            ]);
          })
          .catch(err => {
            log.error('Failed loading app');
            log.error(err);
            return Promise.reject(err);
          })
          .then(() => () => Promise.all([
            mainHttpServer.closeAsync().then(() => log.info(`Closing main http server`)),
            managementHttpServer.closeAsync().then(() => log.info(`Closing management http server`))])
          );
      }
    );
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
    .then(composed => httpServer => httpServer.on('request', require('express')().use(context.env.mountPoint, composed)));
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
    const container = require('express')();
    apps.forEach(app => container.use(app));
    return container;
  });
}

function defaultRunner() {
  return thenable => thenable();
}

module.exports.globals = () => require('./lib/globals/bootstrap-globals').setup();
module.exports.Composer = WixBootstrapComposer;
