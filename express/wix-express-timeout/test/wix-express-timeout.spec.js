const expect = require('chai').expect,
  http = require('wnp-http-test-client'),
  httpTestkit = require('wix-http-testkit'),
  wixExpressTimeout = require('..'),
  {ErrorCode, HttpStatus} = require('wix-errors'),
  request = require('http').request;

describe('wix express timeout', () => {
  let invocation = {};
  const app = aServer().beforeAndAfterEach();

  beforeEach(() => invocation = {});

  it('should allow normal operations', () => {
    return aGet('/ok')
      .then(res => expect(res.status).to.equal(200))
      .then(expectNoError);
  });

  it('should not timeout when overriding the timeout and the first times out assuming the second did not time out (allowing to set override timeout for specific operations)', () => {
    return aGet('/slower/but-fine')
      .then(res => expect(res.status).to.equal(200));
  });

  it('should timeout if the second middleware does timeout in case of timeout override', () => {
    return aGet('/slower/not-fine')
      .then(res => expect(res.status).to.be.equal(504))
      .then(expectTimeoutError);
  });

  it('should not emit timeout event on response if client aborted connection', () => {
    suppressUncaughtExceptionForTest();

    return abortingGet('/slower/not-fine')
      .then(() => delay(500))
      .then(expectNoError);
  });

  function aServer() {
    const server = httpTestkit.server();
    const app = server.getApp();

    app.use(wixExpressTimeout(10));

    app.use((req, res, next) => {
      res.on('x-timeout', err => invocation.xTimeout = err);
      next();
    });

    app.get('/ok', (req, res) => res.send('hi'));
    app.get('/slow', (req, res) => setTimeout(() => res.send('slow'), 10000));
    app.use('/slower/*', wixExpressTimeout(100));
    app.get('/slower/but-fine', (req, res) => setTimeout(() => res.send('slower/but-fine'), 20));
    app.get('/slower/not-fine', (req, res) => setTimeout(() => res.send('slower/not-fine'), 2000));

    app.use((err, req, res, next) => {
      invocation.errorInHandler = err;
      res.status(504).end();
      next();
    });

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

  function expectNoError() {
    expect(invocation).to.deep.equal({})
  }

  function expectTimeoutError() {
    expect(invocation.errorInHandler).to.be.instanceOf(Error);
    expect(invocation.errorInHandler).to.contain.property('_timeout', true);
    expect(invocation.errorInHandler).to.contain.property('httpStatusCode', HttpStatus.GATEWAY_TIMEOUT);
    expect(invocation.errorInHandler).to.contain.property('errorCode', ErrorCode.UNKNOWN);
  }
});
