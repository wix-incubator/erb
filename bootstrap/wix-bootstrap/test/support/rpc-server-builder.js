'use strict';

const jvmTestkit = require('wix-jvm-bootstrap-testkit');

exports.anRpcServer = (port) => {
  let server = jvmTestkit.server({
    artifact: {
      groupId: 'com.wixpress.node',
      artifactId: 'wix-rpc-server',
      version: '1.0.0-SNAPSHOT'
    },
    port: port
  });

  return server;
};