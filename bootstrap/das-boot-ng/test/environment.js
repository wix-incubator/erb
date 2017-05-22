const testkit = require('wix-bootstrap-testkit'),
  rpcTestkit = require('wix-rpc-testkit'),
  configEmitter = require('wix-config-emitter'),
  biTestkit = require('wix-bi-node-testkit'),
  petriTestkit = require('wix-petri-testkit'),
  gatekeeperTestkit = require('wix-gatekeeper-testkit');

const rpcServer = anRpcServer();
const mainApp = bootstrapServer();
const laboratoryServer = aLaboratoryServer();
const biInterceptor = biTestkit.interceptor();
const gatekeeperServer = aGatekeeperServer();

module.exports.biEvents = () => biInterceptor.events;
module.exports.app = mainApp;
module.exports.rpcServer = rpcServer;
module.exports.gatekeeperServer = gatekeeperServer;
module.exports.laboratoryServer = laboratoryServer;

before(function () {
  return Promise.all([
    emitConfigs(rpcServer),
    rpcServer.start(),
    biInterceptor.start(),
    laboratoryServer.start(),
    gatekeeperServer.start(),
  ]).then(() => mainApp.start());
});

after(() => Promise.all([
  mainApp.stop(),
  rpcServer.stop(),
  biInterceptor.stop(),
  laboratoryServer.stop(),
  gatekeeperServer.stop(),
]));

function emitConfigs(rpcServer) {
  return configEmitter({sourceFolders: ['./templates'], targetFolder: './target/configs'})
    .fn('service_url', 'com.wixpress.wix-meta-site-manager-webapp', rpcServer.getUrl())
    .emit();
}

function anRpcServer() {
  const server = rpcTestkit.server({port: 3035});
  server.addHandler('ReadOnlyMetaSiteManager', (req, res) => {
    res.rpc('getMetaSite', (params, respond) => respond({result: {id: params[0], name: 'das-site'}}));
  });

  return server;
}

function aLaboratoryServer() {
  const server = petriTestkit.server();
  server.onConductExperiment(() => 'true');
  return server;
}

function aGatekeeperServer() {
  return gatekeeperTestkit.server();
}

function bootstrapServer() {      
  return testkit.server('./index', {env: {APP_CONF_DIR: './target/configs', WIX_BOOT_PETRI_URL: `http://localhost:${rpcServer.getPort()}`}});
}
