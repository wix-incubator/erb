const expect = require('chai').use(require('sinon-chai')).expect,
  Logger = require('wnp-debug').Logger,
  wixExpressErrorLogger = require('..'),
  sinon = require('sinon');

describe('wix-express-error-logger', () => {
  it('should log error and pass error to next error middleware', () => {
    const log = sinon.createStubInstance(Logger);
    const error = new Error('an error');
    
    wixExpressErrorLogger(log)(error, {}, {}, err => {
      expect(err).to.equal(error);
      expect(log.error).to.have.been.calledWith(error).calledOnce;
    });
  });
});
