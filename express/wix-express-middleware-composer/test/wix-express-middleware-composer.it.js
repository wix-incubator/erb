'use strict';
const expect = require('chai').expect,
  composer = require('..'),
  testkit = require('wix-http-testkit'),
  request = require('request');

describe('wix express middleware composer integration', () => {
  const events = [],
    server = aServer();

  server.beforeAndAfter();

  it('should call composed middlewares within express app', done => {
    request(server.getUrl(), (error, resp, body) => {
      expect(body).to.equal('m1 m2 m3');
      done();
    });
  });

  function aMiddleware(index) {
    return (req, res, next) => {
      events.push(`m${index}`);
      next();
    };
  }

  function aServer() {
    const server = testkit.server();
    const app = server.getApp();

    app.use(composer.get(aMiddleware(1), aMiddleware(2)));
    app.use(aMiddleware(3));
    app.get('/', (req, res) => {
      res.end(events.join(' '));
    });

    return server;
  }
});





