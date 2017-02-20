const expect = require('chai').use(require('sinon-chai')).expect,
  http = require('wnp-http-test-client'),
  testkit = require('./testkit');

describe('error handling', function () {

  describe('default error handler', () => {
    const appFn = app => app
      .get('/', (req, res) => res.end())
      .get('/errors/async', req => process.nextTick(() => {
        throw new Error(req.query.m);
      }))
      .get('/errors/sync', req => {
        throw new Error(req.query.m);
      });

    const {app, log} = testkit(appFn);
    app.beforeAndAfter();

    it('should terminate response and emit "uncaughtException" on unhandled error in callback', () => {
      let uncaughtError;
      onUncaught(err => uncaughtError = err);

      return http(app.getUrl('/errors/async?m=async'))
        .then(res => expect(res.status).to.equal(500))
        .then(() => expect(uncaughtError.message).to.be.string('async'));
    });

    it('should terminate response with error payload and log error', () => {
      return http(app.getUrl('/errors/sync?m=sync'), http.accept.json).then(res => {
        expect(res.status).to.equal(500);
        const {errorCode, message} = res.json();
        expect(errorCode).to.be.equal(-100);
        expect(message).to.match(/Internal Server Error \[.+\]/);
        expect(log.error).to.have.been.calledWith(new Error('sync'));
      });
    });
  });

  describe('custom error handling', () => {
    const appFn = app => app
      .get('/custom/errors/async', req => process.nextTick(() => {
        throw new Error(req.query.m);
      }))
      .get('/custom/errors/sync', req => {
        throw new Error(req.query.m);
      })
      .use((err, req, res, next) => {
        if (err.message) {
          res.status(500).send({name: err.name, message: 'custom-' + err.message});
        }
        next(err);
      });
    const {app, log} = testkit(appFn);
    app.beforeAndAfter();

    it('should not suppress "uncaughtException" when error is handled by custom error handler', () => {
      let uncaughtError;
      onUncaught(err => uncaughtError = err);

      return http(app.getUrl('/custom/errors/async?m=async'), http.accept.json)
        .then(res => expect(res.status).to.equal(500))
        .then(() => expect(uncaughtError.message).to.be.string('async'));
    });

    it('should allow to handle error via custom error handler', () => {
      return http(app.getUrl('/custom/errors/sync?m=sync'), http.accept.json).then(res => {
        expect(res.status).to.equal(500);
        expect(res.json()).to.deep.equal({name: 'Error', message: 'custom-sync'})
      });
    });

    it('should fallback to built-in error handler if it was not handled by custom-one', () => {
      return http(app.getUrl('/custom/errors/sync'), http.accept.json).then(res => {
        expect(res.status).to.equal(500);
        const {errorCode, message} = res.json();
        expect(errorCode).to.be.equal(-100);
        expect(message).to.match(/Internal Server Error \[.+\]/);
      });
    });

    it('should log error if it was forwarded by custom error handler', () => {
      return http(app.getUrl('/custom/errors/sync?m=sync-log'), http.accept.json).then(res => {
        expect(res.status).to.equal(500);
        expect(log.error).to.have.been.calledWith(new Error('sync-log'));
      });
    });
  });

  function onUncaught(cb) {
    process.removeAllListeners('uncaughtException');
    process.on('uncaughtException', cb);
  }

});
