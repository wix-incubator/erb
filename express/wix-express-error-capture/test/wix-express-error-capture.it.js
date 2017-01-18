const fetch = require('node-fetch'),
  express = require('express'),
  expect = require('chai').expect,
  wixExpressErrorCapture = require('..'),
  testkit = require('wix-http-testkit');

describe('wix express error capture middleware it', () => {
  const server = aServer().beforeAndAfter();
  let invocation = {};

  beforeEach(() => invocation = {});

  [{type: 'app', path: '/'}, {type: 'router', path: '/router/'}].forEach(({type, path}) => {
    describe(`for ${type}`, () => {

      it('should handle async error and pass it as critical to error handler', () => {
        return aGet(`${path}async`)
          .then(res => {
            expect(res.status).to.equal(500);
          });
      });
    });
  });

  function aGet(path) {
    return fetch(server.getUrl(path));
  }

  function aServer() {
    const server = testkit.server();
    const app = server.getApp();

    function addHandlers(app) {
      app.get('/async', () => process.nextTick(() => throwError('async')));
      app.get('/sync', () => throwError('sync'));

      function throwError(name) {
        throw new Error(name);
      }

      return app;
    }

    app.use(wixExpressErrorCapture(err => invocation.errorOnHook = err));

    addHandlers(app);
    app.use('/router', addHandlers(new express.Router()));

    app.use((err, req, res, next) => {
      invocation.errorInMiddleware = err;
      res.status(500).end();
      next();
    });

    return server;
  }
});
