const expect = require('chai').expect,
  {RpcRequestError} = require('../lib/errors'),
  {ErrorCode} = require('wix-errors');

describe('RPC error', () => {
   
  it('should extend wixSystemError with appropriate errorCode', () => {
    const err = new RpcRequestError('url', {}, {}, new Error('underlying'));
    expect(err).to.have.property('errorCode', ErrorCode.RPC_ERROR);
    expect(err).not.to.have.property('_exposeMessage');
  });
});



