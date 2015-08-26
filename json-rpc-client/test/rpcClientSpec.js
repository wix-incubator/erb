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

var rpcFactory = function (key) {
  var defaults = require('./defaults');
  var signer = require('signer');  
  var _key = key ? key : defaults().key;
  return  require('../jsonRpcClient')(signer(_key));
};

var rpcClientFor = function(path, key){
  var _rpcFactory = rpcFactory(key);
  return _rpcFactory.rpcClient(urlFor(path));
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
    driver.startServer();
  });

  afterEach(function () {
    tryAble(driver.stopServer);
  });


  it("send and get response from rpc client", function () {
    return expect(rpcClientFor('/SomePath').invoke('add', 2, 2)).to.eventually.equal(4);
  });
  it("send and get response from rpc client for function with no parameters", function () {
    return expect(rpcClientFor('/SomePath').invoke('foo')).to.eventually.equal('bar');
  });
  it("should be rejected because invoke not exists function", function () {
    return expect(rpcClientFor('/SomePath').invoke('notExistsFunction')).to.be.rejectedWith('Method not found');
  });
  it("should be rejected because server is down", function () {
    driver.stopServer();
    return expect(rpcClientFor('/SomePath').invoke('add', 2, 2)).to.be.rejectedWith('connect ECONNREFUSED');
  });
  it("post to 404 endpoint, should be rejected", function () {
    return expect(rpcClientFor('/SomeNonExistPath').invoke('hi')).to.be.rejected;
  });
  it("post to endpoint which does not return json", function () {
    return expect(rpcClientFor('/NonJson').invoke('hi')).to.be.rejected;
  });
});

