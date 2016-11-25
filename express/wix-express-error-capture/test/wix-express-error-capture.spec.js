const expect = require('chai').expect,
  wixExpressErrorCapture = require('..'),
  EventEmitter = require('events');

describe('wix express error capture middleware', function () {
  
  it('should emit x-error once and throw uncaughtException on next async error to not cause infinite loop', done => {
    const asyncMiddleware = wixExpressErrorCapture.async;
    const req = new EventEmitter();
    const res = new EventEmitter();
    let errorInvocationCount = 0;

    process.removeAllListeners('uncaughtException');
    process.on('uncaughtException', () => {
      expect(errorInvocationCount).to.equal(1);
      done();
    });

    res.on('x-error', () => errorInvocationCount += 1);

    asyncMiddleware(req, res, () => {
      process.nextTick(() => {throw new Error('one more')});
      process.nextTick(() => {throw new Error('one more')});
    });
  });

});
