'use strict';
var rp = require('request-promise'),
  chai = require('chai'),
  should = chai.should(),
  expect = chai.expect,
  _ = require('lodash'),
  chaiAsPromised = require('chai-as-promised'),
  within = require('./support/env').withinEnv;

chai.use(chaiAsPromised);

describe('wix-cluster', function() {
  this.timeout(10000);

  it('shuts-down dying worker process gracefully', within('shutdown', { workerCount: 1 }, env => {
    return Promise.all([aGet(''), aGet('/'), aGet('/die')]).should.be.fulfilled
      .then(() => aGet('/')).should.be.rejected
      .then(() => delay(1000))
      .then(() => env.disconnectedWorkerCount()).should.eventually.equal(1);
  }));

  it('respawns dying process', within('respawn', { workerCount: 1 }, (env) => {
    return aGet('/die')
      .then(() => delay(1000))
      .then(() => aGet('/')).should.be.fulfilled
      .then(() => env.disconnectedWorkerCount()).should.eventually.equal(1);
  }));

  it('spawns provided amount of workers', within('defaults', { workerCount: 3 }, env => {
    return env.forkerWorkerCount().should.equal(3);
  }));

  it('runs a management app', within('defaults', { workerCount: 2 }, () => {
    return aGet('/', 8084).should.be.fulfilled;
  }));

  it('respawns dying process and answer from a new instance', within('defaults', { workerCount: 1 }, (env) => {
    let firstId, secondId;
    return aGet('/id')
      .then((res) => {
        firstId = res.body;
        return aGet('/die');
      })
      .then(() => delay(1000))
      .then(() => {
        env.disconnectedWorkerCount().should.equal(1);
      })
      .then(() => aGet('/id'))
      .then((res) => {
        secondId = res.body;
        expect(firstId).to.not.equal(secondId);
      });
  }));

  it('respawns dying process and answer from a new instance given the old instance may still be alive', within('dirty-app-luncher', { workerCount: 1 }, (env) => {
    let firstId, secondId;
    return aGet('/id')
      .then((res) => {
        firstId = res.body;
        return aGet('/die');
      })
      .then(() => delay(1000))
      .then(() => {
        env.disconnectedWorkerCount().should.equal(1);
      })
      .then(() => aGet('/id'))
      .then((res) => {
        secondId = res.body;
        expect(firstId).to.not.equal(secondId);
      });
  }));

  function aGet(path, port) {
    var aPort = port || 3000;
    return rp({uri: `http://localhost:${aPort}${path}`, resolveWithFullResponse: true});
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
});