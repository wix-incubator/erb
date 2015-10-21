'use strict';
const cluster = require('cluster'),
  exchange = require('../..'),
  utils = require('./app-utils.js');

const env = utils.buildEnv();

if (cluster.isMaster) {
  utils.withListener(exchange.client(env.clientTopic));
  const serverExchange = utils.withListener(exchange.server(env.serverTopic));

  utils.forkWithListener();

  serverExchange.broadcast(env.payload);
  utils.sendFor(serverExchange, 'broadcast', env.payload);

} else {
  utils.withListener(exchange.client(env.clientTopic));

  utils.exit();
}