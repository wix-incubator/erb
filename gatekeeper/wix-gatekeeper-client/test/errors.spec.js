const expect = require('chai').expect,
  {GatekeeperAccessDenied} = require('../lib/errors'),
  {ErrorCode, HttpStatus} = require('wix-errors');


describe('GatekeeperAccessDenied error', () => {
  
  it('should extend wixSystemError and have appropriate error code', () => {
    const err = new GatekeeperAccessDenied(new Error('underlying'));
    expect(err).to.have.property('errorCode', ErrorCode.GATEKEEPER_ACCESS_DENIED);
    expect(err).to.have.property('httpStatusCode', HttpStatus.UNAUTHORIZED);
    expect(err).not.to.have.property('_exposeMessage');
  });
});
