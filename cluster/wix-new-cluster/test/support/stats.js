'use strict';
const http = require('wnp-http-test-client'),
  expect = require('chai').expect,
  eventually = require('wix-eventually');

module.exports.assertWorkerCountEquals = (expectedCount) => {
  return eventually(() => getStats().then(stats => expect(stats.workerCount).to.equal(expectedCount)));
};

module.exports.assertDisconnectCountEquals = (expectedCount) => {
  return eventually(() => getStats().then(stats => expect(stats.disconnect).to.equal(expectedCount)));
};

module.exports.getDisconnectCount = () => {
  return getStats().then(stats => stats.disconnect);
};

module.exports.getPeakWorkerCount = () => {
  return getStats().then(stats => stats.maxWorkerCount);
};

function getStats() {
  return http.get('http://localhost:3004/stats').then(res => res.json());
}