'use strict';
const cluster = require('cluster');

module.exports.withListener = exchange => {
  exchange.onMessage(data => {
    process.send({
      origin: cluster.isMaster ? 'cluster' : 'worker',
      src: exchange.broadcast ? 'server-exchange' : 'client-exchange',
      type: 'onMessage',
      topic: exchange.hub.messageKey,
      data: data});
  });
  return exchange;
};

module.exports.sendFor = (exchange, type, data, error) => {
  const env = buildEnv();
  process.send({
    origin: cluster.isMaster ? 'cluster' : 'worker',
    src: exchange.broadcast ? 'server-exchange' : 'client-exchange',
    type: type,
    topic: exchange.broadcast ? env.serverTopic : env.clientTopic,
    data: data,
    error: error});
};

module.exports.forkWithListener = () => {
  const worker = cluster.fork();
  worker.on('message', msg => process.send(msg));
};

module.exports.exit = timeout => {
  const tout = timeout || 200;
  setTimeout(() => process.disconnect(), tout);
};

module.exports.buildEnv = () => buildEnv();

function buildEnv() {
  return {
    serverTopic: process.env.serverTopic,
    clientTopic: process.env.clientTopic,
    payload: process.env.exchangePayload
  };
}