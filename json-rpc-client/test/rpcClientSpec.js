var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
require('chai').use(chaiAsPromised);
var expect = chai.expect;
var driver = require('./drivers/rpcDriver');

var port = 3000;
var base_url = 'http://localhost:' + port;

var urlFor = function (path) {
  return base_url + path;
};



var tryAble = function (f) {
  try {
    f();
  } catch (e) {
    //do nothing
  }
};

describe("rpc client", function () {

  beforeEach(function () {
    var self = this;
    var rpcFactory = function (key) {
      var defaults = require('./defaults');
      var signer = require('signer');
      var _key = key ? key : defaults().key;
      return  require('../jsonRpcClient')(signer(_key));
    };

     this.rpcClientFor = function(path, key){
      var _rpcFactory = rpcFactory(key);
      _rpcFactory.registerHeaderBuildingHook(function(headers, jsonBuffer){
        self.hookSent = true;
      });
      return _rpcFactory.rpcClient(urlFor(path));
    };
    
    driver.startServer();
  });

  afterEach(function () {
    tryAble(driver.stopServer);
  });


  it("send and get response from rpc client", function () {
    return expect(this.rpcClientFor('/SomePath').invoke('add', 2, 2)).to.eventually.equal(4);
  });
  it("send rpc client and check that header hook is triggered", function () {
    var res = expect(this.rpcClientFor('/SomePath').invoke('add', 2, 2)).to.eventually.equal(4);
    expect(this.hookSent).to.equal(true);
    return res;
  });
  it("send and get response from rpc client for function with no parameters", function () {
    return expect(this.rpcClientFor('/SomePath').invoke('foo')).to.eventually.equal('bar');
  });
  it("should be rejected because invoke not exists function", function () {
    return expect(this.rpcClientFor('/SomePath').invoke('notExistsFunction')).to.be.rejectedWith('Method not found');
  });
  it("should be rejected because server is down", function () {
    driver.stopServer();
    return expect(this.rpcClientFor('/SomePath').invoke('add', 2, 2)).to.be.rejectedWith('connect ECONNREFUSED');
  });
  it("post to 404 endpoint, should be rejected", function () {
    return expect(this.rpcClientFor('/SomeNonExistPath').invoke('hi')).to.be.rejected;
  });
  it("post to endpoint which does not return json", function () {
    return expect(this.rpcClientFor('/NonJson').invoke('hi')).to.be.rejected;
  });
});

