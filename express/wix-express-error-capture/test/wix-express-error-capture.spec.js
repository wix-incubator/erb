const expect = require('chai').expect,
  wixExpressErrorCapture = require('..'),
  EventEmitter = require('events');

describe('wix express error capture middleware', () => {

  describe('sync', () => {
    it('should emit sync error as applicative', done => {
      sync((req, res, emitSyncError) => {
        res.on('x-error', e => {
          expect(e).to.be.instanceOf(Error).and.contain.deep.property('applicative', true);
          done();
        });

        emitSyncError(new Error('sync'));
      });
    });

    it('should wrap error passed as string in an error instance', done => {
      sync((req, res, emitSyncError) => {
        res.on('x-error', e => {
          expect(e).to.be.instanceOf(Error).and.contain.deep.property('applicative', true);
          done();
        });

        emitSyncError('sync');
      });
    });

    it('should not pass an error to next on sync error', done => {
      sync((req, res, emitSyncError) => {
        emitSyncError('sync', err => {
          expect(err).to.be.undefined;
          done();
        });
      });
    });
  });

  describe('async', () => {

    it('should emit x-error once and throw uncaughtException on next async error', done => {
      async((req, res, emitAsyncError) => {
        let xErrorInvocationCount = 0;
        res.on('x-error', () => xErrorInvocationCount++);
        onUncaught(() => {
          expect(xErrorInvocationCount).to.equal(1);
          done();
        });

        emitAsyncError('one');
        emitAsyncError('two');
      });
    });
  });

  function async(cb) {
    const req = new EventEmitter();
    const res = new EventEmitter();
    wixExpressErrorCapture.async(req, res, () => cb(req, res, emitAsyncError));
  }

  function sync(cb) {
    const req = new EventEmitter();
    const res = new EventEmitter();
    cb(req, res, (err, next) => wixExpressErrorCapture.sync(err, req, res, next));
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
