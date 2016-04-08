'use strict';
const testkit = require('wix-childprocess-testkit'),
  join = require('path').join,
  envSupport = require('env-support'),
  jvmTestkit = require('wix-jvm-bootstrap-testkit');

let started = false;

const env = envSupport.bootstrap(envSupport.basic({
  RPC_SERVER_PORT: 3310,
  DEBUG: 'wix:*,wnp:*'
}));
const app = testkit.server('it/apps/default/index', {env: env}, testkit.checks.httpGet('/health/is_alive'));
const rpcServer = jvmTestkit.server({
  artifact: {
    groupId: 'com.wixpress.node',
    artifactId: 'wix-rpc-server',
    version: '1.0.0-SNAPSHOT'
  },
  port: env.RPC_SERVER_PORT
});

module.exports.env = env;
module.exports.app = app;
module.exports.rpcServer = rpcServer;

module.exports.start = () => {
  before(() => {
    if (started === false) {
      return rpcServer.start()
        .then(() => app.start()
          .then(() => started = true));
    } else {
      return Promise.resolve();
    }
  });
};

module.exports.appUrl = path => {
  const completePath = join(env.MOUNT_POINT, path || '');
  return `http://localhost:${env.PORT}${completePath}`;
};

module.exports.managementAppUrl = path => {
  const completePath = join(env.MOUNT_POINT, path || '');
  return `http://localhost:${env.MANAGEMENT_PORT}${completePath}`;
};

after(() => {
  if (started === true) {
    return app.stop()
      .then(() => rpcServer.stop())
      .then(() => started = false);
  } else {
    return Promise.resolve();
  }
});