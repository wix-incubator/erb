const {expect} = require('chai'),
  {ErrorCode} = require('wix-errors'),
  handleCsrfErrors = require('../lib/handle-csrf-errors'),
  sinon = require('sinon');

describe('handle csrf errors', () => {

  it('should call next with CsrfAuthenticationError error for error with code EBADCSRFTOKEN', () => {
    const err = new Error();
    err.code = 'EBADCSRFTOKEN';

    const next = sinon.spy();
    handleCsrfErrors(err, {}, {}, next);
    expect(next.args[0][0].errorCode).to.equal(ErrorCode.BAD_CSRF_TOKEN);
  });

  it('should call next with the given error for some error', () => {
    const err = new Error('some error');
    err.code = 'SOME_ERROR';

    const next = sinon.spy();
    handleCsrfErrors(err, {}, {}, next);
    expect(next.calledWith(err)).to.equal(true);
  });

});
