'use strict';
var cluster = require('cluster'),
  exchange = require('../../lib/wix-cluster-exchange'),
  utils = require('./app-utils.js');

var env = utils.buildEnv();

if (cluster.isMaster) {
  utils.withListener(exchange.server(env.serverTopic));

  utils.forkWithListener();
} else {
  var clientExchange = utils.withListener(exchange.client(env.clientTopic));

  clientExchange.send(env.payload);
  utils.sendFor(clientExchange, 'send', env.payload);

  utils.exit();
}