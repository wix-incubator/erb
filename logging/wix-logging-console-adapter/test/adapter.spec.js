'use strict';
var _ = require('lodash'),
  expect = require('chai').expect,
  mockery = require('mockery'),
  lolex = require('lolex');

describe('adapter', () => {
  let events = [],
    clock,
    originalConsole = saveConsole();

  beforeEach(() => {
    mockery.enable({warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true});
    mockery.registerMock('wix-logging-client', {write: evt => events.push(evt)});
    events = [];
    restoreConsole(originalConsole);
    clock = lolex.install();
  });

  afterEach(() => {
    mockery.disable();
    clock.uninstall();
  });

  it('should write msg with category "console" and matching log levels', () => {
    require('..').setup();

    consoleMappings().forEach(pair => {
      pair.fn('log message %s', 'is');

      expect(events.pop()).to.deep.equal({
        timestamp: clock.now,
        level: pair.level,
        category: 'console',
        msg: 'log message is'
      });
    });
  });

  it('should write error with category "console" and matching log levels', () => {
    let error = new Error('woops');
    require('..').setup();

    console.error(error);

    expect(events.pop()).to.deep.equal({
      timestamp: clock.now,
      level: 'error',
      category: 'console',
      error: error
    });
  });

  it('should write empty string for no args', () => {
    require('..').setup();

    console.info();

    expect(events.pop()).to.deep.equal({
      timestamp: clock.now,
      level: 'info',
      category: 'console',
      msg: ''
    });
  });

  it('should write empty string as a single arg', () => {
    require('..').setup();

    console.info('');

    expect(events.pop()).to.deep.equal({
      timestamp: clock.now,
      level: 'info',
      category: 'console',
      msg: ''
    });
  });

  function consoleMappings() {
    let f = (level, fn) => {
      return {level, fn};
    };

    return [f('info', console.info),
      f('info', console.log),
      f('warn', console.warn),
      f('error', console.error)];
  }

  function saveConsole() {
    let originalConsoleFunctions = {};
    _.forEach(['log', 'info', 'warn', 'error'], (level) => {
      originalConsoleFunctions[level] = console[level];
    });
    return originalConsoleFunctions;
  }

  function restoreConsole(originalConsoleFunctions) {
    _.forEach(originalConsoleFunctions, (fn, key) => {
      console[key] = fn;
    });
  }
});