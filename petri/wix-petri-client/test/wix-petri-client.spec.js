'use strict';
const expect = require('chai').expect,
  petriClient = require('..'),
  rpcClient = require('wix-json-rpc-client');

describe('wix-petri-client validation', () => {

  describe('factory', () => {
    it('should fail given rpcFactory is not provided', () => {
      expect(() => petriClient.factory()).to.throw('rpcFactory is mandatory');
    });

    it('should fail given url is not provided', () => {
      expect(() => petriClient.factory(rpcClient.factory())).to.throw('url is mandatory');
    });
  });

  describe('clientFactory', () => {
    it('should fail given aspects are not provided', () => {
      expect(() => petriClient.factory(rpcClient.factory(), 'http://localhost:3000').client())
        .to.throw('aspects must be provided');
    });
  });
});