'use strict';
const _ = require('lodash'),
  Hub = require('cluster-hub');

const hubs = {};

/**
 * A client for exchange. Can be run both on cluster master and workers.
 *
 * @param topic - topic to bind to.
 * @param settings - {getTimeout: 1000}, defaults to 1s
 * @returns {ExchangeClient}
 * @constructor
 */
module.exports.client = (topic, settings) => {
  hubs[topic] = hubs[topic] || new Hub(topic);
  return new ExchangeClient(hubs[topic], settings);
};

/**
 * A server for exchange. Can be run on cluster master only.
 *
 * @param topic - topic to bind to.
 * @returns {ExchangeServer}
 * @constructor
 */
module.exports.server = topic => {
  hubs[topic] = hubs[topic] || new Hub(topic);
  return new ExchangeServer(hubs[topic]);
};

function ExchangeClient(hub, settings) {
  this.settings = settings || {};
  this.getTimeout = this.settings.getTimeout || 1000;
  this.hub = hub;
}

ExchangeClient.prototype.send = function (data) {
  this.hub.sendToMaster('toServer', data);
};

ExchangeClient.prototype.onMessage = function (callback) {
  this.hub.on('fromServer', callback);
};

ExchangeClient.prototype.get = function (callback) {
  var cb = _.once(callback);

  var errorTimeout = setTimeout(() => cb('timeout exceeded while waiting for response'), this.getTimeout);

  this.hub.requestMaster('getServer', null, function (err, data) {
    clearTimeout(errorTimeout);
    cb(err, data);
  });
};

function ExchangeServer(hub) {
  this.hub = hub;
}

ExchangeServer.prototype.onMessage = function (callback) {
  this.hub.on('toServer', callback);
};

ExchangeServer.prototype.broadcast = function (data) {
  this.hub.sendToMaster('fromServer', data);
  this.hub.sendToWorkers('fromServer', data);
};


ExchangeServer.prototype.onGet = function (callback) {
  this.hub.on('getServer', (data, sender, cb) => callback(cb));
};