'use strict';
var cluster = require('cluster');

module.exports.withListener = function(exchange) {
  exchange.onMessage(function (data) {
    process.send({
      origin: cluster.isMaster ? 'cluster' : 'worker',
      src: exchange.broadcast ? 'server-exchange' : 'client-exchange',
      type: 'onMessage',
      topic: exchange.hub.messageKey,
      data: data});
  });
  return exchange;
};

module.exports.sendFor = function (exchange, type, data, error) {
  var env = buildEnv();
  process.send({
    origin: cluster.isMaster ? 'cluster' : 'worker',
    src: exchange.broadcast ? 'server-exchange' : 'client-exchange',
    type: type,
    topic: exchange.broadcast ? env.serverTopic : env.clientTopic,
    data: data,
    error: error});
};

module.exports.forkWithListener = function () {
  var worker = cluster.fork();
  worker.on('message', function (msg) {
    process.send(msg);
  });
};

module.exports.exit = function (timeout) {
  var tout = timeout || 200;
  setTimeout(function () {
    process.disconnect();
  }, tout);
};

module.exports.buildEnv = function () {
  return buildEnv();
};

function buildEnv() {
  return {
    serverTopic: process.env.serverTopic,
    clientTopic: process.env.clientTopic,
    payload: process.env.exchangePayload
  };
}