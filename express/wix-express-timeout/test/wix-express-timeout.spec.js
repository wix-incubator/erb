'use strict';
const request = require('request'),
  expect = require('chai').expect,
  wixExpressTimeout = require('..'),
  httpTestkit = require('wix-http-testkit');

describe('wix express monitor', () => {
  const server = aServer();

  server.beforeAndAfter();

  it('should allow normal operations', done => {
    request.get(server.getUrl('ok'), (error, response) => {
      expect(response.statusCode).to.be.equal(200);
      done();
    });
  });

  it('should emit x-timeout event on response in case of timeout operation', done => {
    request.get(server.getUrl('slow'), (error, response) => {
      expect(response.statusCode).to.be.equal(503);
      expect(response.body).to.be.equal('timeout: request timeout after 10 mSec');
      done();
    });
  });

  it('should not timeout when overriding the timeout and the first times out assuming the second did not time out (allowing to set override timeout for specific operations)', done => {
    request.get(server.getUrl('slower/but-fine'), (error, response) => {
      expect(response.statusCode).to.be.equal(200);
      done();
    });
  });

  it('should timeout if the second middle does timeout in case of timeout override', done => {
    request.get(server.getUrl('slower/not-fine'), (error, response) => {
      expect(response.statusCode).to.be.equal(503);
      expect(response.body).to.be.equal('timeout: request timeout after 100 mSec');
      done();
    });
  });

  function aServer() {
    const server = httpTestkit.httpServer();
    const testApp = server.getApp();

    testApp.use(wixExpressTimeout(10));

    testApp.use((req, res, next) => {
      res.on('x-timeout', message => res.status(503).send('timeout: ' + message));
      next();
    });

    testApp.get('/ok', (req, res) => res.send('hi'));
    testApp.get('/slow', (req, res) => setTimeout(() => res.send('slow'), 10000));

    testApp.use('/slower/*', wixExpressTimeout(100));

    testApp.get('/slower/but-fine', (req, res) => setTimeout(() => res.send('slower/but-fine'), 20));
    testApp.get('/slower/not-fine', (req, res) => setTimeout(() => res.send('slower/not-fine'), 2000));

    return server;
  }
});