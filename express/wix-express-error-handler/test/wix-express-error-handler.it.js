const expect = require('chai').expect,
  http = require('wnp-http-test-client'),
  testkit = require('wix-http-testkit'),
  wixExpressErrorHandler = require('../lib/wix-express-error-handler'),
  aspectMiddleware = require('wix-express-aspects'),
  webContextAspect = require('wix-web-context-aspect'),
  {wixSystemError, wixBusinessError, HttpStatus, ErrorCode} = require('wix-errors');

describe('wix-express-error-handler', function () {
  
  const aspects = aspectMiddleware.get([webContextAspect.builder('some-seen-by')]);
  
  aServer().beforeAndAfter();
  
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

  it('should not interfere with a request that works', () => {
    return aGet('/')
      .then(res => expect(res.text()).to.equal('Hello'));
  });
  
  it('should handle system error for AJAX without request-id being available', () => {
    return aJsonGet('/wix-system-error', HttpStatus.INTERNAL_SERVER_ERROR)
      .then(res => expect(res.json()).to.deep.equal({message: 'Internal Server Error', 'errorCode': ErrorCode.UNKNOWN}));
  });

  it('should handle system error for AJAX with request-id available on aspects', () => {
    //Internal Server Error [request-id: %s]
    return aJsonGet('/wix-system-error?withRequestId=yes-please', HttpStatus.INTERNAL_SERVER_ERROR)
      .then(res => {
        const json = res.json();
        expect(json.errorCode).to.be.equal(ErrorCode.UNKNOWN);
        expect(json.message).to.match(/Internal Server Error \[request-id:.+\]/);
      });
  });
  
  it('should handle business error for AJAX request', () => {
    return aJsonGet('/wix-business-error', HttpStatus.FAILED_DEPENDENCY)
      .then(res => expect(res.json()).to.deep.equal({message: 'woof', 'errorCode': 666}));
  });

  it('should handle business error for non-AJAX request', () => {
    return aGet('/wix-business-error', HttpStatus.FAILED_DEPENDENCY)
      .then(res => expect(res.text()).to.equal(HttpStatus.getStatusText(HttpStatus.FAILED_DEPENDENCY)));
  });

  it('should handle generic Error', () => {
    return aJsonGet('/error', HttpStatus.INTERNAL_SERVER_ERROR)
      .then(res => expect(res.json()).to.deep.equal({message: 'Internal Server Error', 'errorCode': ErrorCode.UNKNOWN}));
  });

  it('should not write response if it was already written', () => {
    return aGet('/write-partial-then-die').then(res => {
      expect(res.text()).to.equal('I\'m partial');
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

  function aServer() {
    const server = testkit.server({port: 3000});
    const app = server.getApp();

    app.use((req, res, next) => {
      if (req.query.withRequestId) {
        aspects(req, res, next);
      } else {
        next();
      }
    });
    
    app.get('/', (req, res) => res.send('Hello'));

    app.get('/error', (req, res, next) => next(new Error('die')));
    
    app.get('/wix-business-error', (req, res, next) => next(new MyBusinessError()));
    
    app.get('/wix-system-error', (req, res, next) => next(new MySystemError()));

    app.get('/write-partial-then-die', (req, res, next) => {
      res.write('I\'m partial');
      next(new Error('die'));
    });

    app.use(wixExpressErrorHandler());

    return server;
  }
});
