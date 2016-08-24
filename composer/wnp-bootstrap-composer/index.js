'use strict';
const join = require('path').join,
  runMode = require('wix-run-mode'),
  log = require('wnp-debug')('wnp-bootstrap-composer'),
  beforeAll = require('./lib/before-all'),
  newRelic = require('./lib/boot-relic'),
  buildFrom = require('./lib/disabler');

class WixBootstrapComposer {
  constructor(opts) {
    beforeAll(runMode, process.env, log, newRelic);
    this._cleanupFns = [];
    this._closeFn = () => Promise.resolve();
    this._mainHttpAppFns = [];
    this._mainExpressAppFns = [context => require('./lib/health').isAlive(context)];
    this._managementAppFns = [context => require('./lib/health').deploymentTest(context),
      context => require('./lib/health').stop(context, () => this._closeFn())];

    this._plugins = [];
    this._appConfigFn = () => context => Promise.resolve(context);
    this._mainExpressAppComposer = (opts && opts.composers && opts.composers.mainExpress) ? opts.composers.mainExpress : defaultExpressAppComposer;
    this._managementExpressAppComposer = (opts && opts.composers && opts.composers.managementExpress) ? opts.composers.managementExpress : defaultExpressAppComposer;
    this._runner = (opts && opts.runner) ? opts.runner : defaultRunner;
  }

  config(appConfigFnFile) {
    this._appConfigFn = () => require(join(process.cwd(), appConfigFnFile));
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

  start(opts) {
    const options = opts || {};
    const effectiveEnvironment = Object.assign({}, process.env, options.env);
    const disabled = buildFrom(effectiveEnvironment, options.disable);
    require('./lib/before-start')(runMode, effectiveEnvironment, log).forEach(el => this._cleanupFns.push(el));
    const mainExpressAppComposer = (disabled.find(el => el === 'express')) ? defaultExpressAppComposer : this._mainExpressAppComposer;
    const managementAppComposer = (disabled.find(el => el === 'management')) ? defaultExpressAppComposer : this._managementExpressAppComposer;
    const runner = (disabled.find(el => el === 'runner')) ? defaultRunner : this._runner;

    let appContext;

    return runner()(() => {
        const mainHttpServer = asyncHttpServer();
        const managementHttpServer = asyncHttpServer();

        return require('./lib/app-context')(effectiveEnvironment, this._plugins)
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
            ]).then(() => console.log('\x1b[33m%s\x1b[0m: ', `Host's URL is: http://${appContext.env.HOSTNAME}:${appContext.env.PORT}`));
          })
          .catch(err => {
            log.error('Failed loading app');
            log.error(err);
            //TODO: best effort in clean-up
            return Promise.reject(err);
          })
          .then(() => {
              this._closeFn = () => {
                //TODO: deuglify
                return Promise.all(this._cleanupFns.map(fn => fn()).join([
                  mainHttpServer.closeAsync().then(() => log.info(`Closing main http server`)),
                  managementHttpServer.closeAsync().then(() => log.info(`Closing management http server`))]))
              };
              return () => this._closeFn();
            }
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
    .then(composed => httpServer => httpServer.on('request', require('express')().use(context.env.MOUNT_POINT, composed)));
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

module.exports.Composer = WixBootstrapComposer;
