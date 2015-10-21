'use strict';
const cluster = require('cluster'),
  exchange = require('../..'),
  utils = require('./app-utils.js');

const env = utils.buildEnv();
const clientSettings = {getTimeout: 50};

if (cluster.isMaster) {
  const serverExchange = utils.withListener(exchange.server(env.serverTopic));

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