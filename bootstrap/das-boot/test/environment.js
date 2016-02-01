'use strict';
const testkit = require('wix-bootstrap-testkit'),
  rpcTestkit = require('wix-rpc-testkit'),
  configEmitter = require('wix-config-emitter');

let started = false;

const app = module.exports.app = bootstrapServer();
const rpcServer = module.exports.rpcServer = anRpcServer();

module.exports.start = () => {
    before(() => {
      if (started === false) {
        return emitConfigs(rpcServer)
          .then(() => rpcServer.start())
          .then(() => app.start())
          .then(() => started = true);
      }
    });
};

after(() => {
  if (started === true) {
    return app.stop()
      .then(() => rpcServer.stop())
      .then(() => started = false);
  }
});

function emitConfigs(rpcServer) {
  return configEmitter({ sourceFolders: ['./templates'], targetFolder: './target/configs'})
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
  return testkit.server('./index', { env: {APP_CONF_DIR: './target/configs'}});
}
