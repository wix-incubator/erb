'use strict';
const chai = require('chai'),
  expect = chai.expect,
  rpcClient = require('..'),
  _ = require('lodash');

describe('json rpc client', () => {
  const factory = rpcClient.factory();
  const client = factory.client('http://localhost');

  describe('client', () => {

    it('should fail for an invocation with no arguments', () => {
      expect(() => factory.client()).to.throw('provided arguments must contain 1..2 elements');
    });

    it('should validate url for 1 arg call', () => {
      expect(() => factory.client('not-a-valid-url')).to.throw('Passed uri(not-a-valid-url) is not valid');
    });
  });

  describe('client.invoke', () => {

    it('should fail for an invocation with no arguments', () => {
      expect(() => client.invoke()).to.throw('At least 1 argument must be provided');
    });
  });

});