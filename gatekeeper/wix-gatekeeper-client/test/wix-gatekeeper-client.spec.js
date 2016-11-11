const expect = require('chai').expect,
  gatekeeperClient = require('..'),
  rpcClient = require('wix-json-rpc-client'),
  AssertionError = require('assert').AssertionError;

describe('wix-gatekeeper-client', () => {

  const aMetasiteId = 'ba919184-cf8d-40a2-9ad6-6fe14f636cde';
  const aPermission = {scope: 'aScope', action: 'anAction'};

  describe('factory', () => {
    it('should fail given rpcFactory is not provided', () => {
      expect(() => gatekeeperClient.factory()).to.throw('rpcFactory is mandatory');
    });

    it('should fail given url is not provided', () => {
      expect(() => gatekeeperClient.factory(rpcClient.factory())).to.throw('url is mandatory');
    });
  });

  describe('clientFactory', () => {
    it('should fail given aspects are not provided', () => {
      expect(() => gatekeeperClient.factory(rpcClient.factory(), 'http://localhost:3000').client())
        .to.throw('aspects must be provided');
    });
  });
  
  describe('authorize', () => {
    it('should throw AssertionError when metasiteId not specified', () => {
      const client = aGatekeeperClient();
      return expect(() => client.authorize(null, aPermission)).to.throw('metasiteId must be provided');
    });
    
    it('should throw AssertionError when permission is not specified', () => {
      const client = aGatekeeperClient();
      return expect(() => client.authorize(aMetasiteId)).to.throw('permission must be provided');
    });

    it('should throw AssertionError when permission.scope not specified', () => {
      const client = aGatekeeperClient();
      return expect(() => client.authorize(aMetasiteId, {action: 'anAction'})).to.throw('permission.scope must be provided');
    });

    it('should throw AssertionError when permission.action not specified', () => {
      const client = aGatekeeperClient();
      return expect(() => client.authorize(aMetasiteId, {scope: 'aScope'})).to.throw('permission.action must be provided');
    });
    
  });
  
  function aGatekeeperClient() {
    return gatekeeperClient.factory(rpcClient.factory(), 'http://localhost:3000').client({});
  }
});

