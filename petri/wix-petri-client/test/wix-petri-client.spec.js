const expect = require('chai').expect,
  petriClient = require('..'),
  rpcClient = require('wix-json-rpc-client');

describe('wix-petri-client', () => {

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

  describe('conductExperiment', () => {

    it('should validate that "key" is provided', () => {
      expect(() => aClient().conductExperiment()).to.throw(/experiment.*key.*mandatory/);
    });

    it('should validate that "key" is string', () => {
      expect(() => aClient().conductExperiment({})).to.throw(/experiment.*key.*string/);
    });

    it('should validate that "fallbackValue" is string', () => {
      expect(() => aClient().conductExperiment('key', {})).to.throw('experiment \'fallbackValue\' must be string');
      expect(() => aClient().conductExperiment('key', false)).to.throw('experiment \'fallbackValue\' must be string');
    });
  });

  describe('conductAllInScope', () => {

    it('should validate that "scope" is provided', () => {
      expect(() => aClient().conductAllInScope()).to.throw(/scope.*mandatory/);
    });

    it('should validate that "scope" is string', () => {
      expect(() => aClient().conductAllInScope({})).to.throw(/scope.*string/);
    });
  });

  describe('conductAllInScopes', () => {
    
    it('should validate that "scopes" is not empty', () => {
      expect(() => aClient().conductAllInScopes()).to.throw(/scopes.*mandatory.*string/);
    });

    it('should validate that "scopes" is a varargs of strings', () => {
      expect(() => aClient().conductAllInScopes(1, 2)).to.throw(/scopes.*mandatory.*string/);
    });
  });
  
  function aClient() {
    return petriClient.factory(rpcClient.factory(), 'http://localhost:3000').client({});
  }
});
