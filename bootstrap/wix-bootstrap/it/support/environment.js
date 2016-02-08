'use strict';
const testkit = require('wix-childprocess-testkit'),
  join = require('path').join,
  envSupport = require('env-support'),
  jvmTestkit = require('wix-jvm-bootstrap-testkit');

let started = false;

const env = envSupport.bootstrap({RPC_SERVER_PORT: 3310});
const app = testkit.server('it/apps/default/index.js', {timeout: 20000, env: env}, testkit.checks.httpGet('/health/is_alive'));
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
  before(done => {
    if (started === false) {
      rpcServer.listen(() => app.start().then(() => {
        started = true;
        done();
      }));
    } else {
      done();
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

after(done => {
  if (started === true) {
    return app.stop().then(rpcServer.close(done));
  } else {
    done();
  }
});