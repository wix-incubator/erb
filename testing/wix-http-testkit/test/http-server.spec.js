'use strict';
const request = require('request'),
  expect = require('chai').expect,
  testkit = require('..');

describe('http-server', () => {

  describe('should start/stop server with promises', () => {
    const server = aServer();

    before(() => server.start());
    after(() => server.stop());

    it('should be started', done => expectA200Ok(server, done));
  });

  describe('should start/stop server with callbacks', () => {
    const server = aServer();

    before(done => server.start(done));
    after(done => server.stop(done));

    it('should be started', done => expectA200Ok(server, done));
  });

  it('should append provided path to getUrl(\'custom\')', () => {
    const server = aServer();

    expect(server.getUrl('custom')).to.equal(`http://localhost:${server.getPort()}/custom`);
  });

  describe('beforeAndAfter', () => {
    const server = aServer();

    before(done => expectAConnectionRefused(server, done));

    server.beforeAndAfter();

    it('should start server before test', done => expectA200Ok(server, done));

    after(done => expectAConnectionRefused(server, done));
  });

  describe('beforeAndAfterEach', () => {
    const server = aServer();

    beforeEach(done => expectAConnectionRefused(server, done));

    server.beforeAndAfterEach();

    it('should start server before test', done => expectA200Ok(server, done));

    afterEach(done => expectAConnectionRefused(server, done));
  });

  function aServer() {
    let server = testkit.server();
    let app = server.getApp();
    app.get('/', function (req, res) {
      res.send('hello');
    });

    app.get('/custom', function (req, res) {
      res.send('hello');
    });

    return server;
  }

  function expectA200Ok(server, cb) {
    request.get(server.getUrl(), (error, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.equal('hello');
      cb();
    });
  }

  function expectAConnectionRefused(server, cb) {
    request.get(server.getUrl(), error => {
      expect(error).to.have.property('code', 'ECONNREFUSED');
      cb();
    });
  }
});