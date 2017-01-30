const expect = require('chai').expect,
  rpcClient = require('..');

describe('json rpc client', () => {
  const factory = rpcClient.factory();
  const clientFactory = factory.clientFactory('http://localhost');

  describe('client', () => {

    it('should fail for an invocation with no arguments', () => {
      expect(() => factory.clientFactory().client()).to.throw('provided arguments must contain 1..2 elements');
    });

    it('should validate url for 1 arg call', () => {
      expect(() => factory.clientFactory('not-a-valid-url')).to.throw('Passed uri(not-a-valid-url) is not valid');
    });
  });

  describe('client.invoke', () => {

    it('should fail for an invocation with no arguments', () => {
      expect(() => clientFactory.client().invoke()).to.throw('At least 1 argument must be provided');
    });

    it('should fail for an invocation with null method', () => {
      expect(() => clientFactory.client().invoke(null)).to.throw('Options object can\'t be null');
    });
  });

});
