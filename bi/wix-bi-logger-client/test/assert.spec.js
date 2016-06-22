'use strict';
const expect = require('chai').expect,
  assert = require('../lib/assert');

describe('assert', () => {


  describe('ok', () => {

    it('should pass for truthful', () => {
      assert.ok(true, '');
    });

    it('should fail for falsy', () => {
      expect(() => assert.ok(null, 'falsey')).to.throw('falsey');
    });
  });

  describe('defined', () => {

    it('should pass for smth', () => {
      assert.defined('', '');
    });

    it('should fail for undefined', () => {
      expect(() => assert.object([], 'woop, undefined')).to.throw('woop, undefined');
    });
  });

  describe('object', () => {
    
    it('should pass for an object', () => {
      assert.object({}, '');
    });

    it('should pass for undefined', () => {
      assert.object(undefined, '');
    });

    it('should fail for array', () => {
      expect(() => assert.object([], 'expected an object')).to.throw('expected an object');
    });

    it('should fail for null', () => {
      expect(() => assert.object(null, 'expected an object')).to.throw('expected an object');
    });

    it('should output custom error message given it is provided', () => {
      expect(() => assert.object(null, 'expected an object')).to.throw('expected an object');
    });


  });
  
});