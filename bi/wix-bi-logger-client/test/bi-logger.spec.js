'use strict';
const expect = require('chai').expect,
  BiLogger = require('../lib/bi-logger'),
  stubs = require('./stubs');

describe('bi-logger', () => {

  describe('log', () => {

    it('should fail when calling without arguments', () => {
      const publisher = stubs.eventCollectingPublisher();
      const client = new BiLogger({publishers: [publisher]});

      expect(() => client.log()).to.throw('Event object or event key must be provided');
    });


    it('should combine defaults with event before passing to publisher', () => {
      const events = [];
      const publisher = stubs.eventCollectingPublisher(events);
      const client = new BiLogger({publishers: [publisher], defaults: {srcId: 2, evtId: 10}});

      return client.log({evtId: 1}).then(() => {
        expect(events).to.deep.equal([{srcId: 2, evtId: 1}]);
      });
    });

    it('should provide separate copy of event for each publisher', () => {
      const events = [];
      const publisher1 = stubs.eventMutatingPublisher();
      const publisher2 = stubs.eventCollectingPublisher(events);
      const client = new BiLogger({publishers: [publisher1, publisher2]});

      return client.log({evtId: 1}).then(() => {
        expect(events).to.deep.equal([{evtId: 1}]);
      });
    });

    it('should support logging with a key form event map', () => {
      const events = [];
      const publisher = stubs.eventCollectingPublisher(events);
      const client = new BiLogger({publishers: [publisher], events: {'KEY': {evtId: 1}}});

      return client.log('KEY').then(() => {
        expect(events).to.deep.equal([{evtId: 1}]);
      });
    });

    it('should return a rejected promise given publisher rejects', () => {
      const publisher = stubs.promiseRejectingPublisher();
      const client = new BiLogger({publishers: [publisher]});

      return client.log({evtId: 1})
        .then(() => Promise.reject(Error('expected log to fail')))
        .catch(err => Promise.resolve(err))
        .then(err => {
          if (err.message === 'expected log to fail') {
            return Promise.resolve();
          }

          expect(err.message).to.equal('Publisher \'PromiseRejectingPublisher\' failed with error: \'publisher failed\'');
        });
    });

    it('should return a rejected promise given publisher threw an exception', () => {
      const publisher = stubs.throwingPublisher();
      const client = new BiLogger({publishers: [publisher]});

      return client.log({evtId: 1})
        .then(() => Promise.reject(Error('expected log to fail')))
        .catch(err => Promise.resolve(err))
        .then(err => {
          if (err.message === 'expected log to fail') {
            return Promise.resolve();
          }

          expect(err.message).to.equal('Publisher \'ThrowingPublisher\' failed with error: \'publisher threw\'');
        });
    });

    it('should merge overrides to an event referenced by key', () => {
      const events = [];
      const publisher = stubs.eventCollectingPublisher(events);
      const client = new BiLogger({publishers: [publisher], events: {'KEY': {evtId: 1}}});

      return client.log('KEY', {exId: 222}).then(() => {
        expect(events).to.deep.equal([{evtId: 1, exId: 222}]);
      });
    });


    it('should fail when logging with a key that is not available in event map', () => {
      const publisher = stubs.eventCollectingPublisher();
      const client = new BiLogger({publishers: [publisher], events: {'KEY': {evtId: 1}}});

      expect(() => client.log('NON-EXISTENT-KEY')).to.throw('Event with key \'NON-EXISTENT-KEY\' not found in event map.');
    });

    it('should promisify sync publisher', () => {
      const events = [];
      const publisher = (event) => events.push(event);
      const client = new BiLogger({publishers: [publisher]});

      return client.log({evtId: 1}).then(() => expect(events).to.deep.equal([{evtId: 1}]));
    });
  });

});