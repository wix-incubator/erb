'use strict';
const request = require('request'),
  expect = require('chai').expect,
  httpTestkit = require('..');
describe('http-server', () => {

  it('should start server via listen() and stop via close()', done => {
    let server = aServer();

    expectAConnectionRefused(server, () => {
      server.listen(() => {
        expectA200Ok(server, () => {
          server.close(() => {
            expectAConnectionRefused(server, done);
          });
        });
      });
    });
  });

  it('should use port 3333 by default if provided and reflect it in getPort(), getUrl()', done => {
    let server = aServer();

    expect(server.getPort()).to.equal(3333);
    expect(server.getUrl()).to.equal('http://localhost:3333');

    server.listen(() => {
      expectA200Ok(server, () => {
        server.close(done);
      });
    });
  });

  it('should append provided path to getUrl(\'custom\')', () => {
    let server = aServer();

    expect(server.getUrl('custom')).to.equal('http://localhost:3333/custom');
  });

  it('should use custom port if provided and reflect it in getPort(), getUrl()', done => {
    let server = aServer(5000);

    expect(server.getPort()).to.equal(5000);
    expect(server.getUrl()).to.equal('http://localhost:5000');


    server.listen(() => {
      expectA200Ok(server, () => {
        server.close(done);
      });
    });
  });


  describe('beforeAndAfter', () => {
    let server = aServer();

    before(done => {
      expectAConnectionRefused(server, done);
    });

    server.beforeAndAfter();

    after(done => {
      expectAConnectionRefused(server, done);
    });

    it('should start server before test', done => {
      expectA200Ok(server, done);
    });

  });

  describe('beforeAndAfterEach', () => {
    let server = aServer(3333);

    beforeEach(done => {
      expectAConnectionRefused(server, done);
    });

    afterEach(done => {
      expectA200Ok(server, done);
    });

    server.beforeAndAfterEach();

    beforeEach(done => {
      expectA200Ok(server, done);
    });

    afterEach(done => {
      expectAConnectionRefused(server, done);
    });

    it('should start server before test', done => {
      expectA200Ok(server, done);
    });
  });

  function aServer(port) {
    let server = httpTestkit.httpServer({port});
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