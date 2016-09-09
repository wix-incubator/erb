'use strict';
const coerce = require('../utils/errors').coerce;

module.exports.workerStarted = workerId => {
  return {channel: 'wix-cluster', id: workerId, type: 'started'};
};

module.exports.isWorkerStarted = msg => {
  return msg && msg.channel && msg.channel === 'wix-cluster' && msg.type && msg.type === 'started';
};

module.exports.isWorkerFailed = msg => {
  return msg && msg.channel && msg.channel === 'wix-cluster' && msg.type && msg.type === 'failed';
};

module.exports.workerFailed = (workerId, err) => {
  return {channel: 'wix-cluster', id: workerId, type: 'failed', data: coerce(err)};
};

module.exports.isYouCanDieNow = msg => {
  return msg && msg.channel && msg.channel === 'wix-cluster' && msg.type && msg.type === 'ga-and-die';
};

module.exports.youCanDieNow = workerId => {
  return {channel: 'wix-cluster', id: workerId, type: 'ga-and-die'};
};

module.exports.isStatsMessage = msg => {
  return msg && msg.channel && msg.channel === 'wix-cluster' && msg.type && msg.type === 'stats';
};

module.exports.youCanDieNow = (workerId, stats) => {
  return {channel: 'wix-cluster', id: workerId, type: 'stats'};
};