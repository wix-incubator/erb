'use strict';
const chai = require('chai'),
  expect = chai.expect,
  rpcRequestSigner = require('../lib/rpc-request-signer'),
  wixHmacSigner = require('wix-hmac-signer'),
  Chance = require('chance'),
  chance = new Chance(),
  lolex = require('lolex');

chai.use(require('./matchers'));

describe('rpc request signer', () => {
  const rpcSign = rpcRequestSigner.get('1234567890');
  const hmacSigner = wixHmacSigner.get('1234567890');
  let headers, clock, now;

  before(() => {
    headers = {};
    clock = lolex.install();
    now = new Date();
  });

  after(() => clock.uninstall());

  it('should sign rpc with less than 1k', () => {
    const jsonRequest = jsonRequestForLength(10);
    var signature = hmacSigner.sign([jsonRequest, now.toString()]);
    expect(rpcSign(jsonRequest, headers)).to.have.signature(signature, now.toString());
  });

  it('should sign rpc with bigger than 1k', function () {
    var jsonRequest = jsonRequestForLength(2000);
    var signature = hmacSigner.sign([new Buffer(jsonRequest).slice(0, 1024), now.toString()]);
    expect(rpcSign(jsonRequest, headers)).to.have.signature(signature, now.toString());
  });

  function jsonRequestForLength(length) {
    return JSON.stringify({jsonrpc: 2, data: chance.string({length: length})});
  }
});