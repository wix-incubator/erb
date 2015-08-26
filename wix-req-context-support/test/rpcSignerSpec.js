var chai = require('chai');
var expect = chai.expect;
var signer = require('signer')('1234567890');
var chance = require('chance')();

var now = function(){
  return 1;
};

var rpcSigner = require('../lib/rpcSigner')(signer, now);

require('./matchers')(chai);

describe("signer", function(){      
  
  before(function(){
    this.headers = {};
  });
  
  var jsonRequestForLength = function(length){
    return JSON.stringify({jsonrpc: 2, data: chance.string({length: length})})
  };
  
  it("sign rpc with less than 1k", function(){
    var jsonRequest = jsonRequestForLength(10);
    var signature = signer.sign([jsonRequest, '1']);  
    expect(rpcSigner.sign(jsonRequest, this.headers)).to.haveSignature(signature, now());
  });

  it("sign rpc with bigger than 1k", function(){
    var jsonRequest = jsonRequestForLength(2000);
    var signature = signer.sign([new Buffer(jsonRequest).slice(0, 1024), '1']);
    expect(rpcSigner.sign(jsonRequest, this.headers)).to.haveSignature(signature, now());
  });
  
});