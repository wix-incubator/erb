const {expect} = require('chai').use(require('sinon-chai')),
  http = require('wnp-http-test-client'),
  testkit = require('wix-http-testkit'),
  wixExpressErrorHandler = require('../lib/wix-express-error-handler'),
  aspectMiddleware = require('wix-express-aspects'),
  webContextAspect = require('wix-web-context-aspect'),
  {wixSystemError, wixBusinessError, HttpStatus, ErrorCode} = require('wix-errors'),
  sinon = require('sinon'),
  {Logger} = require('wnp-debug');

describe('wix-express-error-handler', function () {

  describe('ajax without aspects', () => {
    aServer({aspects: (req, res, next) => next()}).beforeAndAfter();

    it('should handle system error for a request without request-id being available', () => {
      return aJsonGet('/wix-system-error', HttpStatus.INTERNAL_SERVER_ERROR)
        .then(res => expect(res.json()).to.deep.equal({
          message: 'Internal Server Error',
          'errorCode': ErrorCode.UNKNOWN
        }));
    });
  });

  describe('ajax', () => {
    aServer().beforeAndAfter();

    it('should not interfere with a request that works', () => {
      return aJsonGet('/')
        .then(res => expect(res.text()).to.equal('Hello'));
    });

    it('should handle system error for a request with request-id available on aspects', () => {
      //Internal Server Error [request-id: %s]
      return aJsonGet('/wix-system-error?withRequestId=yes-please', HttpStatus.INTERNAL_SERVER_ERROR)
        .then(res => {
          const json = res.json();
          expect(json.errorCode).to.be.equal(ErrorCode.UNKNOWN);
          expect(json.message).to.match(/Internal Server Error \[request-id:.+\]/);
        });
    });

    it('should handle business error', () => {
      return aJsonGet('/wix-business-error', HttpStatus.FAILED_DEPENDENCY)
        .then(res => expect(res.json()).to.deep.equal({message: 'woof', 'errorCode': 666}));
    });

    it('should handle generic Error', () => {
      return aJsonGet('/error', HttpStatus.INTERNAL_SERVER_ERROR)
        .then(res => {
          expect(res.json()).to.contain.property('message').that.contains('Internal Server Error');
          expect(res.json()).to.contain.property('errorCode').that.equals(ErrorCode.UNKNOWN);
        });
    });

    it('should not write response if it was already written', () => {
      return aJsonGet('/write-partial-then-die').then(res => {
        expect(res.text()).to.equal('I\'m partial');
      });
    });

  });

  describe('non-ajax', () => {
    aServer().beforeAndAfter();

    it('should not interfere with a request that works', () => {
      return aGet('/')
        .then(res => expect(res.text()).to.equal('Hello'));
    });

    it('should handle business error with default handler', () => {
      const statusCode = HttpStatus.FAILED_DEPENDENCY;
      return aGet('/wix-business-error', statusCode)
        .then(res => expect(res.text()).to.equal(`Http Error: ${statusCode}`));
    });

    it('should not write response if it was already written', () => {
      return aGet('/write-partial-then-die').then(res => {
        expect(res.text()).to.equal('I\'m partial');
      });
    });
  });

  describe('non-ajax with custom error handler', () => {
    const render = (req, statusCode, errorCode) =>
      `An error for path ${req.path} received with status code: ${statusCode} and error code: ${errorCode}`;

    aServer({render}).beforeAndAfter();

    it('should support custom handler with status and error code', () => {
      const statusCode = HttpStatus.FAILED_DEPENDENCY;
      return aGet('/wix-business-error', statusCode)
        .then(res => expect(res.text()).to.equal(`An error for path /wix-business-error received with status code: ${statusCode} and error code: 666`));
    });

  });

  describe('non-ajax with failing custom error handler', () => {
    const logger = sinon.createStubInstance(Logger);
    const render = () => {
      throw new Error('woops');
    };

    aServer({render, logger}).beforeAndAfter();

    it('should fallback to default renderer if custom one fails and log error', () => {
      const statusCode = HttpStatus.FAILED_DEPENDENCY;
      return aGet('/wix-business-error', statusCode)
        .then(res => {
          expect(res.text()).to.equal(`Http Error: ${statusCode}`);
          expect(logger.error).to.have.been.calledWithMatch('Error occurred with rendering');
        });
    });
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

  function aServer({render, aspects, logger} = {}) {
    const server = testkit.server({port: 3000});
    const app = server.getApp();

    app.use(aspects || aspectMiddleware.get([webContextAspect.builder('some-seen-by')]));

    app.get('/', (req, res) => res.send('Hello'));

    app.get('/error', (req, res, next) => next(new Error('die')));

    app.get('/wix-business-error', (req, res, next) => next(new MyBusinessError()));

    app.get('/wix-system-error', (req, res, next) => next(new MySystemError()));

    app.get('/write-partial-then-die', (req, res, next) => {
      res.write('I\'m partial');
      next(new Error('die'));
    });

    app.use(wixExpressErrorHandler(render, logger));

    return server;
  }
});


class MyBusinessError extends wixBusinessError(666, HttpStatus.FAILED_DEPENDENCY) {
  constructor() {
    super('woof');
  }
}

class MySystemError extends wixSystemError() {
  constructor() {
    super('woof');
  }
}
