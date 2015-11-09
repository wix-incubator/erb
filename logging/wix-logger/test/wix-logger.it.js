'use strict';
const logger = require('..'),
  log4js = require('log4js'),
  expect = require('chai').expect,
  _ = require('lodash');

describe('wix logger', () => {
  let events = [];

  before(() => {
    log4js.clearAppenders();
    log4js.addAppender(appender);
  });

  beforeEach(() => {
    events = [];
  });

  describe('get', () => {
    it('should return an instance of logger with provided category', () => {
      logger.get('cat1').info('msg1');
      expect(events.pop()).to.have.deep.property('categoryName', 'cat1');

      logger.get('cat2').info('msg1');
      expect(events.pop()).to.have.deep.property('categoryName', 'cat2');
    });
  });

  describe('info', () => {
    it('should set level to ERROR and pass arguments to log4js', () => {
      logger.get('cat1').info('msg1 %s', 'arg1');

      let event = events.pop();
      expect(event).to.have.deep.property('level.levelStr', 'INFO');
      expect(Array.prototype.slice.call(event.data[0])).to.deep.equal(['msg1 %s','arg1']);
    });
  });

  describe('error', () => {
    it('should set level to ERROR', () => {
      logger.get('cat1').error('msg1 %s', 'arg1');
      expect(events.pop()).to.have.deep.property('level.levelStr', 'ERROR');
    });

    it('should pass arguments to log4js', () => {
      logger.get('cat1').error('msg1 %s', 'arg1');
      expect(Array.prototype.slice.call(events.pop().data[0])).to.deep.equal(['msg1 %s','arg1']);
    });

    it('should pass only error object if first argument is error', () => {
      let error = Error('woops');
      logger.get('cat1').error(error);
      console.log(events[0].data);
      expect(Array.prototype.slice.call(events.pop().data[0])).to.deep.equal([error]);
    });

    it.only('should pass new error if arguments are: [string, Error]', () => {
      let error = Error('woops');
      logger.get('cat1').error('woops2', error);

      let event = events.pop().data[0];

      expect(event).to.be.instanceof(Error);
      expect(event.message).to.equal('woops2 [Error: woops]');
      expect(event.stack).to.deep.equal(error.stack);
    });
  });

  function appender(event) {
    events.push(event);
  }
});