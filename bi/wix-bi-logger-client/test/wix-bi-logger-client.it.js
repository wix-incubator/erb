'use strict';
const expect = require('chai').expect,
  biLogger = require('..'),
  stubs = require('./stubs');

describe('wix-bi-logger-client', () => {
  let events, loggerFactory;

  beforeEach(() => {
    events = [];
    loggerFactory = biLogger.factory()
      .addPublisher(stubs.eventCollectingPublisher(events));
  });

  it('should allow to plug-in backend and invoke it when calling "log"', () => {
    const bi = loggerFactory.logger({});

    return bi.log({evtId: 1}).then(() => {
      expect(events).to.deep.equal([{evtId: 1}]);
    });
  });

  it('should allow to plug-in multiple backend and invoke them when calling "log"', () => {
    loggerFactory.addPublisher(stubs.eventCollectingPublisher(events));
    const bi = loggerFactory.logger({});

    return bi.log({evtId: 1}).then(() => {
      expect(events).to.deep.equal([{evtId: 1}, {evtId: 1}]);
    });
  });

  it('should allow to set-up shared properties for all events', () => {
    loggerFactory.setDefaults({srcId: 5});
    const bi = loggerFactory.logger({});

    return bi.log({evtId: 1}).then(() => {
      expect(events).to.deep.equal([{srcId: 5, evtId: 1}]);
    });
  });

  it('should allow to set context per logger', () => {
    return Promise.all([
      loggerFactory.logger({ctxId: 10}).log({evtId: 1}),
      loggerFactory.logger({ctxId: 20}).log({evtId: 1})
    ]).then(() => {
      expect(events).to.deep.equal([{evtId: 1, ctxId: 10}, {evtId: 1, ctxId: 20}]);
    });
  });

  it('should allow to add event map and reference it via log', () => {
    loggerFactory.setEvents({
      'EVT_1': {evtId: 1}
    });

    const bi = loggerFactory.logger({});

    return bi.log('EVT_1').then(() => {
      expect(events).to.deep.equal([{evtId: 1}]);
    });
  });
});