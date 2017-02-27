const expect = require('chai').expect,
  {SessionExpiredError, SessionMalformedError} = require('../lib/errors'),
  {ErrorCode, HttpStatus} = require('wix-errors');

describe('session crypto exceptions', () => {
   
  it('should extend wixSystemError with appropriate code and HTTP status code', () => {
    const err1 = new SessionExpiredError('uups, expired');
    const err2 = new SessionMalformedError('uups, malformed');

    expect(err1).to.have.property('errorCode', ErrorCode.INVALID_SESSION);
    expect(err1).to.have.property('httpStatusCode', HttpStatus.UNAUTHORIZED);
    expect(err1).not.to.have.property('_exposeMessage');

    expect(err2).to.have.property('errorCode', ErrorCode.INVALID_SESSION);
    expect(err2).to.have.property('httpStatusCode', HttpStatus.UNAUTHORIZED);
    expect(err2).not.to.have.property('_exposeMessage');
  });
});
