const fetch = require('node-fetch'),
  {expect} = require('chai').use(require('chai-as-promised')),
  testkit = require('..'),
  HttpsAgent = require('https').Agent,
  defaultPort = require('wix-test-ports').HTTP;

describe('wix-http-testkit', function () {
  this.timeout(10000);

  describe('should have consistent default port', () => {
    const server1 = aServer();
    const server2 = aServer();

    expect(server1.getPort())
      .to.equal(server2.getPort())
      .to.equal(defaultPort);
  });

  describe('should start/stop', () => {
    const server = aServer();

    before(() => server.start());
    after(() => server.stop());

    it('should be started', () => expectA200Ok(server));
  });

  describe('should disable powered-by header', () => {
    const server = aServer();

    before(() => server.start());
    after(() => server.stop());

    it('not send x-powered-by header', () => {
      return fetch(server.getUrl())
        .then(res => expect(res.headers.get('x-powered-by')).to.equal(null));
    });
  });

  describe('should extend TestkitBase', () => {
    const server = aServer();

    before(() => expectAConnectionRefused(server));

    server.beforeAndAfter();

    it('should start server before test', () => expectA200Ok(server));

    after(() => expectAConnectionRefused(server));
  });

  it('should append provided path to getUrl(\'custom\')', () => {
    const server = aServer();

    expect(server.getUrl('custom')).to.equal(`http://localhost:${server.getPort()}/custom`);
  });

  describe('socket timeout override', () => {
    const server = aServer({timeout: 100}).beforeAndAfter();

    it('should respect explicit socket timeout set', done => {
      const before = Date.now();

      fetch(`http://localhost:${server.getPort()}/no-response`)
        .catch(e => {
          expect(Date.now() - before).to.be.within(80, 200);
          expect(e.message).to.be.string('socket hang up');
          done();
        });
    });
  });


  describe('ssl support', () => {
    const server = aServer({ssl: true}).beforeAndAfterEach();

    it('should serve on https with self-signed certificates', () => {
      return fetch(`https://localhost:${server.getPort()}/`, {agent: new HttpsAgent({rejectUnauthorized: false})});
    });

    it('should return url with https:// if server is created with ssl support', () =>
      expect(aServer({ssl: true}).getUrl('custom')).to.be.string('https://')
    );
  });


  function aServer(opts) {
    let server = testkit.server(opts || {});
    server.getApp().get('/', (req, res) => res.end());
    server.getApp().get('/no-response', () => {
    });

    return server;
  }

  function expectA200Ok(server) {
    return fetch(server.getUrl()).then(res => expect(res.status).to.equal(200));
  }

  function expectAConnectionRefused(server) {
    return expect(fetch(server.getUrl())).to.be.rejectedWith('ECONNREFUSED');
  }
});
