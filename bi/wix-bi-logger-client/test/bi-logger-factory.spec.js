'use strict';
const expect = require('chai').expect,
  biLogger = require('..');

describe('bi-logger-factory', () => {

  describe('addPublisher', () => {

    it('should fail when calling with undefined', () => {
      expect(() => biLogger.factory().addPublisher()).to.throw('Publisher must be provided');
    });

    it('should fail when passing not a publisher', () => {
      expect(() => biLogger.factory().addPublisher({})).to.throw('Expected a publisher function');
    });
  });

  describe('setDefaults', () => {

    it('should fail when calling with undefined', () => {
      expect(() => biLogger.factory().setDefaults()).to.throw('Defaults must be provided');
    });

    it('should fail when passing not an object', () => {
      expect(() => biLogger.factory().setDefaults('')).to.throw('Defaults must be an object');
    });
  });

  describe('addEvents', () => {

    it('should fail when calling with undefined', () => {
      expect(() => biLogger.factory().setEvents()).to.throw('Events must be provided');
    });

    it('should fail when passing not an object', () => {
      expect(() => biLogger.factory().setEvents('')).to.throw('Events must be an object');
    });
  });


});

