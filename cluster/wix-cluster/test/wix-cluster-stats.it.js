'use strict';
var rp = require('request-promise'),
  expect = require('chai').expect,
  _ = require('lodash'),
  within = require('./support/env').withinEnv;

describe('wix cluster stats', function () {
  this.timeout(30000);

  it('should publish events on worker forks', within('defaults', {workerCount: 2}, () => {
    return stats().then(res => {
      expect(_.filter(res, {type: 'forked'}).length).to.equal(2);
      expect(_.filter(res, {type: 'disconnected'}).length).to.equal(0);
    });
  }));

  it('should publish events on worker deaths', within('defaults', {workerCount: 2}, () => {
    return kill()
      .then(() => delay(500))
      .then(() => stats())
      .then(res => {
        expect(_.filter(res, {type: 'forked'}).length).to.equal(3);
        expect(_.filter(res, {type: 'disconnected'}).length).to.equal(1);
      });
  }));

  it('should publish events on master and worker memory usage', within('defaults', {workerCount: 2}, () => {
    return stats().then(res => {
      expect(_.filter(res, {type: 'stats'}).length).to.equal(3);
    });
  }));

  function kill() {
    return rp('http://localhost:3000/die');
  }

  function stats() {
    return rp('http://localhost:8084/stats').then(res => {
      return JSON.parse(res);
    });
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
  }

});