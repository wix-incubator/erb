'use strict';
const expect = require('chai').expect,
  mockery = require('mockery'),
  chance = require('chance')();

//TODO: it tests
describe('wix rpc client support', () => {
  let rpcFactory, reqContextMock, wixRpcClientSupport;

  before(() => {
    rpcFactory = new StubRpcFactory();
    reqContextMock = new ReqContextMock();
    mockery.enable({warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true});
    mockery.registerMock('wix-req-context', reqContextMock);

    wixRpcClientSupport = require('..');
    wixRpcClientSupport.get({rpcSigningKey: '1234567890'}).addTo(rpcFactory);
  });

  after(() => mockery.disable());

  it('should validate that rpcSigningKey is present', () => {
    expect(() => wixRpcClientSupport.get({})).to.throw(Error, 'rpcSigningKey is mandatory');
  });

  //TODO: add more headers
  it('should inject headers from "wix-req-context"', () => {
    rpcFactory.invoke();
    expect(rpcFactory.invoke().headers).to.have.property('X-Wix-Request-Id', reqContextMock.get().requestId);
  });

  //TODO: validate signature
  it('should apply registered hooks onto request', () => {
    rpcFactory.invoke();
    expect(rpcFactory.invoke().headers).to.have.property('X-Wix-Signature');
  });

  function StubRpcFactory() {
    const functions = [];
    const resHooks = [];

    this.headers = {};
    this.jsonBuffer = '{}';
    this.registerHeaderBuildingHook = fn => functions.push(fn);
    this.registerResponseHeaderHook = fn => resHooks.push(fn);
    this.invoke = () => {
      functions.forEach(fn => fn(this.headers, this.jsonBuffer));
      return this;
    };
  }

  function ReqContextMock() {
    const requestId = chance.guid();
    this.get = () => {
      return { requestId };
    };
  }
});
