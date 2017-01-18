const expect = require('chai').expect,
  http = require('wnp-http-test-client'),
  testkit = require('wix-http-testkit'),
  wixExpressErrorHandler = require('../lib/wix-express-error-handler'),
  wixExpressTimeout = require('wix-express-timeout');

describe('wix-express-error-handler', function () {
  this.timeout(30000);
  aServer().beforeAndAfter();

  it('should not interfere with a request that works', () => {
    return aGet('/')
      .then(res => expect(res.text()).to.equal('Hello'));
  });

  describe('error', () => {

    it('should render json response for json accept headers', () => {
      return aJsonGet('/error', 500)
        .then(res => expect(res.json()).to.deep.equal({message: 'die', name: 'Error'}))
    });

    it('should render html response by default', () => {
      return aGet('/error', 500)
        .then(res => expect(res.text()).to.equal('Internal Server Error'))
    });

    it('should not write response if it was already written', () => {
      return aGet('/write-partial-then-die').then(res => {
        expect(res.text()).to.equal('I\'m partial');
      });
    });
  });

  describe('timeout', () => {

    it('should render json response for json accept headers', () => {
      return aJsonGet('/timeout', 504).then(res => {
        expect(res.json()).to.deep.equal({name: 'TimeoutError', message: 'request timed out after 200 mSec'});
      })
    });

    it('should, on timeout after writing response head, return HTTP 200 with the partial body and close response within 1 second (timeout defined in app.js)', () =>
      aGet('/write-partial-then-timeout').then(res => {
        expect(res.elapsedTime).to.be.within(100, 500);
        expect(res.text()).to.equal('I\'m partial');
      })
    );

    it('should, on timeout to write response, return HTTP 504 with body \'Gateway Timeout\'', () =>
      aGet('/timeout', 504).then(res => {
        expect(res.elapsedTime).to.be.within(100, 500);
        expect(res.text()).to.equal('Gateway Timeout');
      })
    );


  });

  function aGet(path, expectedStatus, opts) {
    const start = new Date().getTime();
    return http(`http://localhost:3000${path}`, opts || {}).then(res => {
      expect(res.status).to.equal(expectedStatus || 200);
      res.elapsedTime = new Date().getTime() - start;
      return res
    });
  }

  function aJsonGet(path, expectedStatus) {
    return aGet(path, expectedStatus, {
      headers: {
        Accept: 'application/json'
      }
    });
  }

  function aServer() {
    const server = testkit.server({port: 3000});
    const app = server.getApp();

    app.use(wixExpressTimeout(200));

    app.get('/', (req, res) => res.send('Hello'));

    app.get('/error', (req, res, next) => next(new Error('die')));

    app.get('/timeout', () => {
    });

    app.get('/write-partial-then-timeout', (req, res) => res.write('I\'m partial'));

    app.get('/write-partial-then-die', (req, res, next) => {
      res.write('I\'m partial');
      next(new Error('die'));
    });

    app.use(wixExpressErrorHandler());

    return server;
  }
});
