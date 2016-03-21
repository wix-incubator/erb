'use strict';
var expect = require('chai').expect,
  mockery = require('mockery'),
  lolex = require('lolex');

describe('adapter', () => {
  let events = [], clock;

  beforeEach(() => {
    mockery.enable({warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true});
    mockery.registerMock('wix-logging-client', {write: evt => events.push(evt)});
    clock = lolex.install();
    events = [];
    process.env.DEBUG = 'cat';
  });

  afterEach(() => {
    mockery.disable();
    clock.uninstall();
  });

  it('should take over debug logging functions and log a message with "debug" level', () => {
    let debug = require('debug');
    require('..').setup(debug);

    debug('cat')('event from debug %s', 'is');

    expect(events.pop()).to.deep.equal({
      timestamp: clock.now,
      level: 'debug',
      category: 'cat',
      msg: 'event from debug is'
    });
  });

  it('writes error into msg instead of error', () => {
    let error = new Error('woops');
    let debug = require('debug');
    require('..').setup(debug);

    debug('cat')(error);

    expect(events.pop()).to.deep.equal({
      timestamp: clock.now,
      level: 'debug',
      category: 'cat',
      msg: error.stack || error.message
    });
  });

  it('should write empty string for no args', () => {
    let debug = require('debug');
    require('..').setup(debug);

    debug('cat')();

    expect(events.pop()).to.deep.equal({
      timestamp: clock.now,
      level: 'debug',
      category: 'cat',
      msg: ''
    });
  });

  it('should write empty string as a single arg', () => {
    let debug = require('debug');
    require('..').setup(debug);

    debug('cat')('');

    expect(events.pop()).to.deep.equal({
      timestamp: clock.now,
      level: 'debug',
      category: 'cat',
      msg: ''
    });
  });

  it('should obey DEBUG env variable', () => {
    process.env.DEBUG = '';
    let debug = require('debug');
    require('..').setup(debug);

    debug('cat')('event from debug');
    expect(events).to.be.empty;
  });
});