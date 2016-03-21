'use strict';
const chai = require('chai'),
  expect = chai.expect,
  _ = require('lodash'),
  testkit = require('./support/env'),
  fetch = require('node-fetch');

chai.use(require('chai-as-promised'));

describe('wix cluster error handling', function() {
  this.timeout(10000);

  describe('for a client app that does not compile', () => {
    const server = testkit.app('errors-client-app-does-not-compile', {workerCount: 1});

    before(done => server.start(done));
    after(done => server.stop(done));

    it('should log error and callback with error given app fails to start', () => {
      expect(getErrorEvent(server)).to.contain.deep.property('err.message', 'Failed to start app [Error: Cannot find module \'./does-not-exist\']');
      expect(server.output).to.be.string('Failed to start app');
    });
  });

  describe('for a client app that returns error via callback', () => {
    const server = testkit.app('errors-client-app-calls-back-with-error', {workerCount: 1});

    before(done => server.start(done));
    after(done => server.stop(done));

    it('should log error and pass-on error onto start() callback', () => {
      expect(getErrorEvent(server)).to.contain.deep.property('err.message', 'Failed to start app [Error: got some problems starting]');
      expect(server.output).to.be.string('Failed to start app');
    });
  });

  describe('cluster plugin that returns error via callback .onWorker', () => {
    const server = testkit.app('errors-client-plugin-calls-back-with-error', {workerCount: 1});

    before(done => server.start(done));
    after(done => server.stop(done));

    it('should pass-on error onto start()', () => {
      expect(getErrorEvent(server)).to.contain.deep.property('err.message', 'Failed to start app [Error: client plugin failed]');
      expect(server.output).to.be.string('Failed to start app');
    });
  });

  describe('cluster plugin that throws error in .onWorker', () => {
    const server = testkit.app('errors-client-plugin-throws-exception', {workerCount: 1});

    before(done => server.start(done));
    after(done => server.stop(done));

    it('should pass-on error onto start()', () => {
      expect(getErrorEvent(server)).to.contain.deep.property('err.message', 'Failed to start app [Error: client plugin throws]');
      expect(server.output).to.be.string('Failed to start app');
    });
  });

  describe('cluster plugin that returns error via callback .onMaster', () => {
    const server = testkit.app('errors-master-plugin-calls-back-with-error', {workerCount: 1});

    before(done => server.start(done));
    after(done => server.stop(done));

    it('should pass-on error onto start() and should not launch client app', () => {
      expect(getErrorEvent(server)).to.contain.deep.property('err.message', 'Failed to start app [Error: master plugin failed]');
      expect(server.output).to.be.string('Failed to start app');
      return expect(fetch('http://localhost:3000/')).to.be.rejected;
    });
  });

  describe('cluster plugin that throws in .onMaster', () => {
    const server = testkit.app('errors-master-plugin-throws-exception', {workerCount: 1});

    before(done => server.start(done));
    after(done => server.stop(done));

    it('should pass-on error onto start() and should not launch client app', () => {
      expect(getErrorEvent(server)).to.contain.deep.property('err.message', 'Failed to start app [Error: master plugin throws]');
      expect(server.output).to.be.string('Failed to start app');
      return expect(fetch('http://localhost:3000/')).to.be.rejected;
    });
  });

  describe('cluster master that fails to start', () => {
    const server = testkit.app('errors-master-plugin-throws-exception', {workerCount: 1});

    before(done => server.start(done));
    after(done => server.stop(done));

    it('should pass-on error onto start() and should not launch client app but should start management app', () => {
      expect(getErrorEvent(server)).to.contain.deep.property('err.message', 'Failed to start app [Error: master plugin throws]');
      expect(server.output).to.be.string('Failed to start app');
      return expect(fetch('http://localhost:3004/')).to.be.fulfilled;
    });
  });

  function getErrorEvent(server) {
    return _.find(server.events(), evt => evt.event ==='start-completed' && evt.err);
  }

});