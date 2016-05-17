'use strict';
const testkit = require('wix-bootstrap-testkit'),
  rpcTestkit = require('wix-rpc-testkit'),
  configEmitter = require('wix-config-emitter'),
  biTestkit = require('wix-bi-node-testkit');

const mainApp = bootstrapServer();
const rpcServer = anRpcServer();
const biInterceptor = biTestkit.interceptor();

module.exports.biEvents = () => biInterceptor.events;
module.exports.app = mainApp;
module.exports.rpcServer = rpcServer;

before(function () {
  this.timeout(10000);
  return Promise.all([emitConfigs(rpcServer), rpcServer.start(), biInterceptor.start()])
    .then(() => mainApp.start());
});

after(() => Promise.all([mainApp.stop(), rpcServer.stop(), biInterceptor.stop()]));

function emitConfigs(rpcServer) {
  return configEmitter({sourceFolders: ['./templates'], targetFolder: './target/configs'})
    .fn('service_url', 'com.wixpress.wix-meta-site-manager-webapp', rpcServer.getUrl())
    .emit();
}

function anRpcServer() {
  const server = rpcTestkit.server();
  server.addHandler('ReadOnlyMetaSiteManager', (req, res) => {
    res.rpc('getMetaSite', (params, respond) => respond({result: {id: params[0], name: 'das-site'}}));
  });

  return server;
}

function bootstrapServer() {
  return testkit.server('./index', {env: {APP_CONF_DIR: './target/configs'}});
}
