'use strict';
const expect = require('chai').expect,
  httpTestkit = require('wix-http-testkit'),
  request = require('request'),
  uuidGenerator = require('uuid-support'),
  shared = require('./shared');

describe('support it', () => {
  const server = aServer();
  let events = [];
  const reqOptions = {
    url: server.getUrl(),
    headers: {
      'x-wix-request-id': uuidGenerator.generate()
    }
  };

  server.beforeAndAfter();

  //TODO: add additional field validation
  it('should inject metadata from request', done => {
    request(reqOptions, (error, response) => {
      expect(response.statusCode).to.equal(200);
      expect(events.pop()).to.contain.deep.property('req.requestId', reqOptions.headers['x-wix-request-id']);
      done();
    });
  });

  function aServer() {
    const server = httpTestkit.httpServer();
    const app = server.getApp();

    let client = shared.fakeClient();
    require('..').addTo(client);
    app.use(require('wix-express-domain'));
    app.use(require('wix-express-req-context'));

    app.get('/', (req, resp) => {
      events.push(client.apply({}));
      resp.end();
    });

    return server;
  }

});