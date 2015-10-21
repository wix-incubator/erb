'use strict';
const _ = require('lodash'),
  expect = require('chai').expect,
  mockery = require('mockery'),
  intercept = require('intercept-stdout');


describe('incoming event', () => {
  let plugin, exchange, output;

  beforeEach(() => {
    output = new StdErrOutInterceptor();
    exchange = new ExchangeMock();
    mockery.enable({warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true});
    mockery.registerMock('wix-cluster-exchange', exchange);
    plugin = require('..')();
  });

  afterEach(() => {
    mockery.disable();
    output.restore();
  });

  describe('timestamp', () => {

    it('must be present', done => {
      let event = anEventWithout('timestamp');

      givenEvent(event, () => {
        expectAnError('timestamp is mandatory and must be a number', event, done);
      });
    });

    it('must be a number', done => {
      let event = anEvent({timestamp: 'aString', msg: 'a message'});

      givenEvent(event, () => {
        expectAnError('timestamp is mandatory and must be a number', event, done);
      });
    });
  });

  describe('level', () => {

    it('must be present', done => {
      let event = anEventWithout('level');

      givenEvent(event, () => {
        expectAnError('level is mandatory and must be one of [debug, info, warn, error]', event, done);
      });
    });

    it('must be one of [debug, info, warn, error]', done => {
      let event = anEvent({level: 'qwe234', msg: 'a message'});

      givenEvent(event, () => {
        expectAnError('level is mandatory and must be one of [debug, info, warn, error]', event, done);
      });
    });

  });

  describe('category', () => {

    it('must be present', done => {
      let event = anEventWithout('category');

      givenEvent(event, () => {
        expectAnError('category is mandatory', event, done);
      });
    });
  });

  describe('error', () => {

    it('must be an object', done => {
      let event = anEvent({error: 'notAnObject'});

      givenEvent(event, () => {
        expectAnError('error must be an object', event, done);
      });
    });
  });

  it('is invalid if neither error nor msg is provided', done => {
    let event = anEvent();

    givenEvent(event, () => {
      expectAnError('either error or msg must be provided', event, done);
    });
  });

  it('is valid if msg is provided', done => {
    let event = anEvent({msg: 'a msg'});

    givenEvent(event, () => {
      expectASuccess(done);
    });
  });

  it('is valid if error is provided', done => {
    let event = anEvent({
      error: {
        name: 'error',
        message: 'woops',
        stack: 'stack'
      }
    });

    givenEvent(event, () => {
      expectASuccess(done);
    });
  });

  it('is valid if error and msg is provided', done => {
    let event = anEvent({
      error: {
        name: 'error',
        message: 'woops',
        stack: 'stack'
      }
    });

    givenEvent(event, () => {
      expectASuccess(done);
    });
  });

  function expectAnError(msg, evt, done) {
    process.nextTick(() => {
      expect(output.stderr().pop()).to.equal(`Logging event: ${JSON.stringify(evt)} rejected with reason(s): '${msg}'\n`);
      done();
    });
  }

  function expectASuccess(done) {
    process.nextTick(() => {
      expect(output.stderr()).to.be.empty;
      expect(output.stdout().length).to.equal(1);
      done();
    });
  }

  function givenEvent(event, cb) {
    plugin.onMaster({}, () => {
      exchange.send(event);
      cb();
    });
  }

  function ExchangeMock() {
    var callback = () => { throw Error('call send after cluster init');};
    this.send = event => callback(event);
    this.server = () => {
      return {
        onMessage: cb => callback = cb
      };
    };
  }

  function anEvent(partial) {
    return _.merge({
      timestamp: 0,
      level: 'info',
      category: 'cat'
    }, partial);
  }

  function anEventWithout(key) {
    let evt = anEvent({msg: 'message'});
    delete evt[key];
    return evt;
  }

  function StdErrOutInterceptor() {
    let stdout = [],
      stderr = [],
      detach;

    detach = intercept(
      out => stdout.push(out),
      err => stderr.push(err));

    this.stdout = function () {
      return stdout;
    };

    this.stderr = function () {
      return stderr;
    };

    this.restore = function () {
      detach();
    };
  }
});