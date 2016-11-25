const fetch = require('node-fetch'),
  express = require('express'),
  expect = require('chai').expect,
  wixExpressErrorCapture = require('..'),
  testkit = require('wix-http-testkit');

describe('wix express error capture middleware it', () => {
  let invocation = {};
  const server = aServer().beforeAndAfter();

  beforeEach(() => invocation = {middleware: false});

  [{type: 'app', path: '/'}, {type: 'router', path: '/router/'}].forEach(setup => {

    it(`should intercept async errors and make sure errors are emitted on the response for ${setup.type}`, () =>
      assertResponse('async', nonApplicative('async')));

    it(`should intercept sync errors and make sure errors are emitted on the response ${setup.type}`, () =>
      assertResponse('sync', applicative('sync')));


    it('passes control onto next middleware without error in next callback on sync error', () =>
      assertResponse('sync', applicative('sync'))
        .then(() => expect(invocation).to.deep.equal({middleware: true})));

    function applicative(message) {
      const err = nonApplicative(message);
      err.applicative = true;
      return err;
    }

    function nonApplicative(message) {
      return {name: 'Error', message};
    }

    function assertResponse(path, expectedResponse) {
      return fetch(server.getUrl(setup.path + path))
        .then(res => {
          expect(res.status).to.equal(500);
          return res.json();
        })
        .then(json => expect(json).to.deep.equal(expectedResponse));
    }
  });

  function aServer() {
    const server = testkit.server();
    const app = server.getApp();
    const router = new express.Router();

    app.use(wixExpressErrorCapture.async);

    app.use((req, res, next) => {
      res.on('x-error', err => {
        res.status('500').json({name: err.name, message: err.message, applicative: err.applicative});
      });
      next();
    });

    addHandlers(app);
    addHandlers(router);
    app.use('/router', router);

    app.use(wixExpressErrorCapture.sync);

    app.use((req, res, next) => {
      invocation.middleware = true;
      next();
    });

    app.use((err, req, res, next) => {
      invocation.errMiddleware = true;
      invocation.err = err;
      next();
    });

    return server;
  }

  function addHandlers(app) {
    app.get('/async', () => {
      process.nextTick(() => {
        throw new Error('async');
      });
    });

    app.get('/sync', () => {
      throw new Error('sync');
    });
  }
});
