const GatekeeperDockerizedTestkit = require('./gatekeeper-rpc');
const StatsdDockerizedTestkit = require('./statsd');
const RpcDockerizedTestkit = require('./metasite-rpc');
const DockerizedApp = require('./docker/dockerized-app');

const gatekeeperServer = new GatekeeperDockerizedTestkit();
const statsdServer = new StatsdDockerizedTestkit();
const rpcServer = new RpcDockerizedTestkit();

const collaborators = [gatekeeperServer, statsdServer, rpcServer];

const app = new DockerizedApp(collaborators, configEmitter => {
  return configEmitter
    .fn('service_url', 'com.wixpress.wix-meta-site-manager-webapp', rpcServer.serviceUrl)
})

function startCollaborators() {
  this.timeout(10 * 60 * 1000);
  return Promise.all(collaborators.map(collaborator => collaborator.start()));
}

function stopCollaborators() {
  return Promise.all(collaborators.map(collaborator => collaborator.stop()));
}


before(startCollaborators);
before(function () {
  this.timeout(10 * 60 * 1000);
  return app.start();
});

beforeEach(() => {
  return Promise.all([
    () => rpcServer.reset(),
    () => gatekeeperServer.reset(),
    () => statsdServer.reset()])
});

after(() => app.stop());
after(stopCollaborators);


module.exports = {
  app, statsdServer, rpcServer, gatekeeperServer
};
