'use strict';
const cluster = require('cluster'),
  exchange = require('../..'),
  utils = require('./app-utils.js');

const env = utils.buildEnv();

if (cluster.isMaster) {
  utils.withListener(exchange.server(env.serverTopic));

  utils.forkWithListener();
} else {
  const clientExchange = utils.withListener(exchange.client(env.clientTopic));

  clientExchange.send(env.payload);
  utils.sendFor(clientExchange, 'send', env.payload);

  utils.exit();
}