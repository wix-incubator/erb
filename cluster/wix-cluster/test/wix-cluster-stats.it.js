'use strict';
var rp = require('request-promise'),
  expect = require('chai').expect,
  _ = require('lodash'),
  within = require('./support/env').withinEnv;

describe('wix cluster stats', function () {
  this.timeout(30000);

  it('should publish events on worker memory usage', within('defaults', {workerCount: 2}, () => {
    return stats().then(res => {
      expect(_.filter(res, {type: 'stats'}).length).to.equal(2);
    });
  }));

  function stats() {
    return rp('http://localhost:8084/stats').then(res => {
      return JSON.parse(res);
    });
  }

});