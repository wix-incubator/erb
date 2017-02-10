const expect = require('chai').expect,
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
    const {app} = testkit(appFn);
    app.beforeAndAfter();

    it('should log error and kill process', () => {
      let uncaughtError;
      onUncaught(err => uncaughtError = err);

      return http(app.getUrl('/errors/async?m=async'))
        .then(res => expect(res.status).to.equal(500))
        .then(() => expect(uncaughtError.message).to.be.string('async'));
    });

    it('should keep process running, return response and log error', () => {
      let uncaughtError;
      onUncaught(err => uncaughtError = err);

      return http(app.getUrl('/errors/sync?m=sync'), http.accept.json).then(res => {
        expect(res.status).to.equal(500);
        expect(res.json()).to.deep.equal({name: 'Error', message: 'sync'});
      })
        .then(() => expect(uncaughtError).to.be.undefined)
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
        if (err._timeout && err._timeout === true) {
          res.status(504).send({name: 'x-timeout', message: 'custom-timeout'});
        } else {
          res.status(500).send({name: err.name, message: 'custom-' + err.message});
        }
        next(err);
      });
    const {app} = testkit(appFn);
    app.beforeAndAfter();

    it('should log error and kill process on async/uncaught error', () => {
      let uncaughtError;
      onUncaught(err => uncaughtError = err);

      http(app.getUrl('/custom/errors/async?m=async'), http.accept.json).then(res => {
        expect(res.status).to.equal(500);
        expect(res.json()).to.deep.equal({name: 'Error', message: 'custom-async'});
      })
        .then(() => expect(uncaughtError.message).to.be.string('async'));
    });

    it('should keep process running, return response and log error on sync error', () => {
      let uncaughtError;
      onUncaught(err => uncaughtError = err);

      http(app.getUrl('/custom/errors/sync?m=sync'), http.accept.json).then(res => {
        expect(res.status).to.equal(500);
        expect(res.json()).to.deep.equal({name: 'Error', message: 'custom-sync'})
      })
        .then(() => expect(uncaughtError).to.be.undefined);
    });
  });

  function onUncaught(cb) {
    process.removeAllListeners('uncaughtException');
    process.on('uncaughtException', cb);
  }

});
