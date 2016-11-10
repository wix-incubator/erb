'use strict';
const expect = require('chai').expect,
  http = require('wnp-http-test-client'),
  httpTestkit = require('wix-http-testkit'),
  wixExpressTimeout = require('..'),
  request = require('http').request;

describe('wix express timeout', () => {
  let timeoutEventEmitted = false;
  const app = anApp().beforeAndAfterEach();

  beforeEach(() => timeoutEventEmitted = false);

  it('should allow normal operations', () =>
    aGet('/ok').then(res => expect(res.status).to.equal(200))
      .then(() => delay(50))
      .then(() => expect(timeoutEventEmitted).to.equal(false))
  );

  it('should emit x-timeout event on response in case of timeout operation', () =>
    aGet('/slow').then(res => {
      expect(res.status).to.equal(504);
      expect(res.json()).to.deep.equal({name: 'Error', message: 'request timed out after 10 mSec'});
    })
  );

  it('should not timeout when overriding the timeout and the first times out assuming the second did not time out (allowing to set override timeout for specific operations)', () =>
    aGet('/slower/but-fine').then(res => expect(res.status).to.equal(200))
  );

  it('should timeout if the second middleware does timeout in case of timeout override', () =>
    aGet('/slower/not-fine').then(res => {
      expect(res.status).to.be.equal(504);
      expect(res.json()).to.deep.equal({name: 'Error', message: 'request timed out after 100 mSec'});
    })
  );

  it('should not emit timeout event on response if client aborted connection', () => {
    suppressUncaughtExceptionForTest();

    return abortingGet('/slower/not-fine')
      .then(() => delay(500))
      .then(() => expect(timeoutEventEmitted).to.equal(false));
  });

  function anApp() {
    const server = httpTestkit.server();
    const app = server.getApp();

    app.use(wixExpressTimeout.get(10));

    app.use((req, res, next) => {
      res.on('x-timeout', err => {
        timeoutEventEmitted = true;
        if (!res.headersSent) {
          res.status(504).json({name: err.name, message: err.message})
        }
      });
      next();
    });

    app.get('/ok', (req, res) => res.send('hi'));
    app.get('/slow', (req, res) => setTimeout(() => res.send('slow'), 10000));

    app.use('/slower/*', wixExpressTimeout.get(100));

    app.get('/slower/but-fine', (req, res) => setTimeout(() => res.send('slower/but-fine'), 20));
    app.get('/slower/not-fine', (req, res) => setTimeout(() => res.send('slower/not-fine'), 2000));
    app.post('/slower/not-fine', (req, res) => setTimeout(() => res.send('slower/not-fine'), 2000));


    return server;
  }

  function abortingGet(path) {
    return new Promise(resolve => {
      const options = {port: app.getPort(), path: path, method: 'POST'};
      const req = request(options);
      req.on('abort', () => resolve());
      req.end('', () => req.abort());
    });
  }

  function suppressUncaughtExceptionForTest() {
    process.removeAllListeners('uncaughtException');
    process.on('uncaughtException', e => console.log('Suppressing uncaughException for test', e));
  }

  function aGet(path) {
    return http.get(app.getUrl(path));
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

});
