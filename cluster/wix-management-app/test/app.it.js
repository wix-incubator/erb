'use strict';
const chai = require('chai'),
  should = chai.should(),
  chaiAsPromised = require('chai-as-promised'),
  rp = require('request-promise'),
  within = require('./support/env').withinEnv,
  _ = require('lodash'),
  match = require('./support/matchers');

chai.use(match);
chai.use(chaiAsPromised);

describe('management app', () => {

  describe('/', () => {

    it('should serve basic app info', within('defaults', anEnv(), (env) => {
      //TODO: this should be unit test? now I cannot test uptime and time
      return rp('http://localhost:8084/')
        .then((response) => response.should.match({
          appName: 'my-app',
          mountPoint: '/',
          port: '8080',
          managementPort: '8084',
          version: process.version,
          pid: env.pid()
        }));
    }));
  });

  describe('health/deployment/test', () => {

    it('should respond with 200 if at least 1 app responds to is_alive with "ok"', within('alive', anEnv('alive'), () => {
      return rp('http://localhost:8080/health/is_alive')
        .then(() => { return rp('http://localhost:8084/health/deployment/test'); } );
    }));

    it('should respond with 500 if no worker processes are active', within('alive', anEnv('no-workers'), () => {
      return rp('http://localhost:8080/health/is_alive').should.be.rejectedWith('ECONNREFUSED')
        .then(() => { return rp('http://localhost:8084/health/deployment/test'); } ).should.be.rejectedWith('500');
    }));

    it('should respond with 500 if connected worker process responds with other than 200', within('alive', anEnv('dead-worker'), () => {
      return rp('http://localhost:8080/health/is_alive').should.be.rejectedWith('500')
        .then(() => { return rp('http://localhost:8084/health/deployment/test'); } ).should.be.rejectedWith('500');
    }));

  });

  function anEnv(appType) {
    return _.merge({ MOUNT_POINT: '/', PORT: 8080, MANAGEMENT_PORT: 8084, APP_NAME: 'my-app' }, {APP_TYPE: appType});
  }

  describe('stats', () => {
    it('should server basic stats', within('defaults', anEnv(), () => {
      return rp('http://localhost:8084/stats')
        //TODO: tightly coupled with cluster-plugin, maybe plugin logic should be in mgmt app? unit test?
        .then((response) => response.should.match({
          forked: 0,
          died: 0
        }));
    }));
  });

});