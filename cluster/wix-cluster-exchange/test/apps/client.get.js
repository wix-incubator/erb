'use strict';
var cluster = require('cluster'),
  exchange = require('../../lib/wix-cluster-exchange'),
  utils = require('./app-utils.js');

var env = utils.buildEnv();
var clientSettings = {getTimeout: 50};

if (cluster.isMaster) {
  var serverExchange = utils.withListener(exchange.server(env.serverTopic));

  serverExchange.onGet(function (callback) {
    utils.sendFor(serverExchange, 'onGet', env.payload);
    callback(null, env.payload);
  });

  withSendFor(
    utils.withListener(exchange.client(env.clientTopic, clientSettings))
  );

  utils.forkWithListener();
} else {
  withSendFor(
    utils.withListener(exchange.client(env.clientTopic, clientSettings))
  );

  utils.exit();
}

function withSendFor(exchangeClient) {
  exchangeClient.get(function (error, data) {
    utils.sendFor(exchangeClient, 'get', data, error);
  });
}