'use strict';
var expect = require('chai').expect,
  mockery = require('mockery'),
  lolex = require('lolex');

describe('adapter', () => {
  let events = [],
    clock,
    log4js;

  beforeEach(() => {
    mockery.enable({warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true});
    mockery.registerMock('wix-logging-client', {write: evt => events.push(evt)});
    events = [];
    clock = lolex.install();
    log4js = require('log4js');
    require('..').setup(log4js);
  });

  afterEach(() => {
    mockery.disable();
    clock.uninstall();
  });

  it('should write msg with category "default" and matching log levels for category-less logger', () => {
    let logger = log4js.getLogger();

    ['debug', 'info', 'warn', 'error'].forEach(level => {
      logger[level]('log message %s', 'is');

      expect(events.pop()).to.deep.equal({
        timestamp: clock.now,
        level: level,
        category: 'default',
        msg: 'log message is'
      });
    });
  });

  it('should write event with category requested via getLogger()', () => {
    log4js.getLogger('cat').info('log message %s', 'is');

    expect(events.pop()).to.deep.equal({
      timestamp: clock.now,
      level: 'info',
      category: 'cat',
      msg: 'log message is'
    });
  });

  it('should write event with "trace" level as "debug"', () => {
    log4js.getLogger('cat').trace('log message %s', 'is');

    expect(events.pop()).to.deep.equal({
      timestamp: clock.now,
      level: 'debug',
      category: 'cat',
      msg: 'log message is'
    });
  });

  it('should write event with "fatal" level as "error"', () => {
    log4js.getLogger('cat').fatal('log message %s', 'is');

    expect(events.pop()).to.deep.equal({
      timestamp: clock.now,
      level: 'error',
      category: 'cat',
      msg: 'log message is'
    });
  });

  it('writes error into msg instead of error', () => {
    let error = new Error('woops');
    log4js.getLogger('cat').error(error);

    expect(events.pop()).to.deep.equal({
      timestamp: clock.now,
      level: 'error',
      category: 'cat',
      error: error
    });
  });

  it('should write empty string for no args', () => {
    log4js.getLogger('cat').debug();

    expect(events.pop()).to.deep.equal({
      timestamp: clock.now,
      level: 'debug',
      category: 'cat',
      msg: ''
    });
  });

  it('should write empty string as a single arg', () => {
    log4js.getLogger('cat').info('');

    expect(events.pop()).to.deep.equal({
      timestamp: clock.now,
      level: 'info',
      category: 'cat',
      msg: ''
    });
  });

});