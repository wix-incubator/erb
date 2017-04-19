const {expect} = require('chai').use(require('../support/matchers')),
  rpcRequestSigner = require('../../lib/request-hooks/rpc-request-signer'),
  wixHmacSigner = require('wix-hmac-signer'),
  chance = require('chance')(),
  lolex = require('lolex');

describe('rpc request signer', () => {
  const rpcSign = rpcRequestSigner.get('1234567890');
  const hmacSigner = wixHmacSigner.get('1234567890');
  let headers, clock, now;

  before(() => {
    headers = {};
    clock = lolex.install();
    now = Date.now();
  });

  after(() => clock.uninstall());

  it('should sign rpc with less than 1k', () => {
    const jsonRequest = jsonRequestForLength(10);
    const signature = hmacSigner.sign([jsonRequest, now.toString()]);
    expect(rpcSign(headers, jsonRequest)).to.have.signature(signature, now.toString());
  });

  it('should sign rpc with bigger than 1k', function () {
    const jsonRequest = jsonRequestForLength(2000);
    const signature = hmacSigner.sign([new Buffer(jsonRequest).slice(0, 1024), now.toString()]);
    expect(rpcSign(headers, jsonRequest)).to.have.signature(signature, now.toString());
  });

  function jsonRequestForLength(length) {
    return JSON.toString({jsonrpc: 2, data: chance.string({length: length})});
  }
});
