'use strict';
const http = require('wnp-http-test-client'),
  expect = require('chai').expect;

module.exports.workerCount = (app, expectedCount) => {
  return app.getStats().then(stats => expect(stats.workerCount).to.equal(expectedCount));
};

module.exports.disconnectCount = (app, expectedCount) => {
  return app.getStats().then(stats => expect(stats.disconnect).to.equal(expectedCount));
};

module.exports.getDisconnectCount = app => {
  return app.getStats().then(stats => stats.disconnect);
};

module.exports.getPeakWorkerCount = app => {
  return app.getStats().then(stats => stats.maxWorkerCount);
};