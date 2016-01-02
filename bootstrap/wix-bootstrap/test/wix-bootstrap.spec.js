'use strict';
const request = require('request'),
  _ = require('lodash'),
  chai = require('chai'),
  expect = chai.expect,
  wixRequestBuilder = require('./support/wix-request-builder'),
  rpcServerBuilder = require('./support/rpc-server-builder'),
  bootstrapBuilder = require('./support/bootstrap-builder');

chai.use(require('./matchers'));
chai.use(require('chai-things'));

const env = {
  RPC_SERVER_PORT: 3010
};

describe('wix bootstrap', function () {
  this.timeout(60000);

  const rpcServer = rpcServerBuilder.anRpcServer(env.RPC_SERVER_PORT);
  const app = bootstrapBuilder.bootstrapApp('test/app/index.js', { env });

  rpcServer.beforeAndAfter();
  app.beforeAndAfter();

  const wixRequest = () => wixRequestBuilder.aWixRequest(app.getUrl());
  const wixManagementRequest = () => wixRequestBuilder.aWixRequest(app.getManagementUrl());

  it('should start app on port and mount point defined by env', done => {
    let req = wixRequest().get('/');

    request(req.options(), (error, response) => {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it('should expose "/health/is_alive"', done => {
    let req = wixRequest().get('/health/is_alive');

    request(req.options(), (error, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.equal('Alive');
      done();
    });
  });

  it('should serve management apps "/health/deployment/test"', done => {
    let req = wixManagementRequest().get('/health/deployment/test');

    request(req.options(), (error, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.equal('Test passed');
      done();
    });
  });

  it('should serve app-info on "/app-info"', done => {
    let req = wixManagementRequest().get('/app-info');

    request(req.options(), (error, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.contain('com.wixpress.npm.wix-bootstrap');
      done();
    });
  });

  it('should provide pre-configured rpc client', done => {
    let req = wixRequest().get('/rpc');

    request(req.options(), (error, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(JSON.parse(body)).to.deep.equal({
        name: 'John',
        email: 'doe@wix.com'
      });
      done();
    });
  });

  it('should log via cluster', done => {
    const req = wixRequest().get('/log-info');

    request(req.options(), (error, response, body) => {
      expect(response.statusCode).to.equal(200);

      setTimeout(() => {
        //TODO: dehardcode it - fragile
        expect(app.stdout()).to.include.an.item.that.has.string('INFO category=[app] from request');
        done();
      }, 500);
    });
  });

  it.skip('should report app metrics', () => {
  });

  it.skip('should report request-scoped metrics', () => {
  });

  ['', '/router'].forEach(basePath => {
    describe(`express should provide access within request scope on ${basePath} to`, () => {

      it('request context', done => {
        const req = wixRequest().get(`${basePath}/req-context`);

        request(req.options(), (error, response, body) => {
          expect(response.statusCode).to.equal(200);
          expect(body).asJson.to.have.deep.property('requestId', req.headers['X-Wix-Request-Id']);
          done();
        });
      });

      it('petri cookies', done => {
        const req = wixRequest().get(`${basePath}/petri`).withPetri();

        request(req.options(), (error, response, body) => {
          expect(response.statusCode).to.equal(200);
          expect(body).asJson.to.have.deep.property('_wixAB3', req.cookies._wixAB3);
          done();
        });
      });

      it('decoded session', done => {
        const req = wixRequest().get(`${basePath}/wix-session`).withSession();

        request(req.options(), (error, response, body) => {
          expect(response.statusCode).to.equal(200);
          expect(body).asJson.to.deep.equal(req.wixSession.sessionJson);
          done();
        });
      });

      it('should handle async errors with express', done => {
        const req = wixRequest().get(`${basePath}/async-error`);

        request(req.options(), (error, response, body) => {
          expect(response.statusCode).to.equal(500);
          expect(body).asJson.to.deep.equal({
            name: 'x-error',
            message: 'async'
          });
          done();
        });
      });

      it('should handle sync errors with express', done => {
        const req = wixRequest().get(`${basePath}/sync-error`);

        request(req.options(), (error, response, body) => {
          expect(response.statusCode).to.equal(500);
          expect(body).asJson.to.deep.equal({
            name: 'x-error',
            message: 'sync'
          });
          done();
        });
      });

      it('should enable setting timeout', done => {
        const req = wixRequest().get(`${basePath}/timeout-1500`);

        request(req.options(), (error, response, body) => {
          expect(response.statusCode).to.equal(503);
          expect(body).asJson.to.deep.equal({
            name: 'x-timeout',
            message: 'timeout'
          });
          done();
        });
      });
    });
  });






});


