const expect = require('chai').use(require('sinon-chai')).expect,
  wixExpressErrorCapture = require('..'),
  EventEmitter = require('events'),
  sinon = require('sinon');

describe('wix express error capture middleware', () => {

  it('should pass error to next', done => {
    const error = new Error('async');
    const {req, res} = mocks();
    const next = nextHandler(error);

    wixExpressErrorCapture()(req, res, next.fn);

    process.nextTick(() => {
      expect(next.capturedArgs.length).to.equal(1);
      expect(next.capturedArgs[0]).to.equal(error);
      done();
    });
  });

  it('should invoke hook function with error', done => {
    const error = new Error('async');
    const {req, res} = mocks();
    const next = nextHandler(error);
    const onError = sinon.spy();

    wixExpressErrorCapture(onError)(req, res, next.fn);

    process.nextTick(() => {
      expect(onError).to.have.been.calledWith(error).calledOnce;
      done();
    });
  });
  
  
  it('should wrap error passed as string', done => {
    const error = 'async';
    const {req, res} = mocks();
    const next = nextHandler(error);

    wixExpressErrorCapture()(req, res, next.fn);

    process.nextTick(() => {
      expect(next.capturedArgs[0]).to.be.instanceOf(Error);
      done();
    });
  });

  it('should handle error only once, result in uncaught afterwards', done => {
    const error = new Error('async');
    const {req, res} = mocks();
    const next = nextHandler(error);

    wixExpressErrorCapture()(req, res, next.fn);

    onUncaught(err => {
      expect(err).to.be.instanceOf(Error);
      done();
    });

    next.fn();
  });


  function nextHandler(error) {
    const capturedNextArgs = [];
    const next = arg => {
      if (!arg) {
        emitAsyncError(error);
      } else {
        capturedNextArgs.push(arg);
      }
    };

    return {
      fn: next,
      capturedArgs: capturedNextArgs
    }
  }

  function mocks() {
    const req = sinon.createStubInstance(EventEmitter);
    const res = sinon.createStubInstance(EventEmitter);
    const next = sinon.spy();

    return {req, res, next};
  }

  function emitAsyncError(err) {
    process.nextTick(() => {
      throw err;
    });
  }

  function onUncaught(cb) {
    process.removeAllListeners('uncaughtException');
    process.on('uncaughtException', cb);
  }
});
