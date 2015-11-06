'use strict';
var cluster = require('cluster'),
    exchange = require('../../lib/wix-cluster-exchange'),
    utils = require('./app-utils.js');

var env = utils.buildEnv();

if (cluster.isMaster) {
  utils.withListener(exchange.client(env.clientTopic));
  var serverExchange = utils.withListener(exchange.server(env.serverTopic));

  utils.forkWithListener();

  serverExchange.broadcast(env.payload);
  utils.sendFor(serverExchange, 'broadcast', env.payload);

} else {
  utils.withListener(exchange.client(env.clientTopic));

  utils.exit();
}