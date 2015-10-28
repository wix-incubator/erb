'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
require('chai').use(chaiAsPromised);
var expect = chai.expect;
var driver = require('./drivers/rpc-driver');

describe('rpc client', function () {

  beforeEach(driver.startServer);

  afterEach(driver.stopServer);

  it('send and get response from rpc client', function () {
    return expect(driver.rpcClientFor('/SomePath').invoke('add', 2, 2)).to.eventually.equal(4);
  });
  it('send rpc client and check that header hook is triggered', function () {
    var hookSentFlag = false;
    var factoryWithHook = driver.rpcFactoryWithHook(function () {
      hookSentFlag = true;
    });

    var res = expect(factoryWithHook.rpcClientFor('/SomePath').invoke('add', 2, 2)).to.eventually.equal(4);
    expect(hookSentFlag).to.equal(true);
    return res;
  });
  it('send and get response from rpc client for function with no parameters', function () {
    return expect(driver.rpcClientFor('/SomePath').invoke('foo')).to.eventually.equal('bar');
  });
  it('should be rejected because invoke not exists function', function () {
    return expect(driver.rpcClientFor('/SomePath').invoke('notExistsFunction')).to.be.rejectedWith('Method not found');
  });
  it('should be rejected because server is down', function () {
    driver.stopServer();
    return expect(driver.rpcClientFor('/SomePath').invoke('add', 2, 2)).to.be.rejectedWith('connect ECONNREFUSED');
  });
  it('post to 404 endpoint, should be rejected', function () {
    return expect(driver.rpcClientFor('/SomeNonExistPath').invoke('hi')).to.be.rejected;
  });
  it('post to endpoint which does not return json', function () {
    return expect(driver.rpcClientFor('/NonJson').invoke('hi')).to.be.rejected;
  });
});

