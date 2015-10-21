'use strict';
const chai = require('chai'),
  _ = require('lodash'),
  expect = chai.expect,
  givenApp = require('./support/env');

chai.use(require('./support/matchers'));
chai.use(require('chai-things'));

describe('cluster-exchange', () => {
  const validEnv = {clientTopic: 'topic1', serverTopic: 'topic1', exchangePayload: 'someData'};
  const envWithDifferentTopics = {clientTopic: 'topic1', serverTopic: 'topic2', exchangePayload: 'someData'};

  it('should send messages from client on worker to server', (done) => {
    givenApp('client.send', validEnv, (serverEvents, clientEvents) => {
      expect(serverEvents).to.have.length(1)
        .and.all.to.match(serverEventWith({type: 'onMessage'}));
      expect(clientEvents).to.have.length(1)
        .and.all.to.match(clientEventWith({type: 'send'}));
      done();
    });
  });

  it('should send messages from client on master to server', (done) => {
    givenApp('server.send', validEnv, (serverEvents, clientEvents) => {
      expect(serverEvents).to.have.length(1)
        .and.all.to.match(serverEventWith({type: 'onMessage'}));
      expect(clientEvents).to.have.length(1)
        .and.all.to.match(serverEventWith({type: 'send'}));
      done();
    });
  });


  it('should not receive messages sent by client from different topic', (done) => {
    givenApp('client.send', envWithDifferentTopics, (serverEvents, clientEvents) => {
      expect(serverEvents).to.have.length(0);
      expect(clientEvents).to.have.length(1);
      done();
    });
  });

  it('should receive messages sent by server both on workers and on cluster', (done) => {
    givenApp('server.broadcast', validEnv, (serverEvents, clientEvents) => {
      expect(serverEvents).to.have.length(1)
        .and.all.to.match(serverEventWith({type: 'broadcast'}));
      expect(clientEvents).to.have.length(2)
        .and.include.one.that.matches(clientEventWith({origin: 'worker', type: 'onMessage'}))
        .and.include.one.that.matches(clientEventWith({origin: 'cluster', type: 'onMessage'}));
      done();
    });
  });

  it('should not receive messages sent by server from different topic', (done) => {
    givenApp('server.broadcast', envWithDifferentTopics, (serverEvents, clientEvents) => {
      expect(serverEvents).to.have.length(1);
      expect(clientEvents).to.have.length(0);
      done();
    });
  });

  it('should get data from server both when requesting form cluster and worker', (done) => {
    givenApp('client.get', validEnv, (serverEvents, clientEvents) => {
      expect(serverEvents).to.have.length(2)
        .and.all.to.match(serverEventWith({type: 'onGet'}));
      expect(clientEvents).to.have.length(2)
        .and.include.one.that.matches(clientEventWith({origin: 'cluster', type: 'get'}))
        .and.include.one.that.matches(clientEventWith({origin: 'worker', type: 'get'}));
      done();
    });
  });

  it('should get an error when requesting data from non-existent topic (as timeout)', (done) => {
    givenApp('client.get', envWithDifferentTopics, (serverEvents, clientEvents) => {
      expect(serverEvents).to.have.length(0);
      expect(clientEvents).to.have.length(2)
        .and.include.one.that.matches(clientEventWith({origin: 'cluster', type: 'get', error: 'timeout exceeded while waiting for response'}))
        .and.include.one.that.matches(clientEventWith({origin: 'worker', type: 'get', error: 'timeout exceeded while waiting for response'
        }));
      done();
    });
  });

  function clientEventWith(partialObject) {
    return eventWith(validEnv.clientTopic, partialObject);
  }

  function serverEventWith(partialObject) {
    return eventWith(validEnv.serverTopic, partialObject);
  }

  function eventWith(topic, partialObject) {
    if (partialObject.error) {
      return _.merge({topic}, partialObject);
    } else {
      return _.merge({topic, data: validEnv.exchangePayload}, partialObject);
    }
  }
});