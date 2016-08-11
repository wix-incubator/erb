'use strict';
const fetch = require('node-fetch'),
  chai = require('chai'),
  expect = chai.expect,
  testkit = require('..'),
  HttpsAgent = require('https').Agent;

chai.use(require('chai-as-promised'));

describe('wix-http-testkit', () => {

  describe('should start/stop', () => {
    const server = aServer();

    before(() => server.start());
    after(() => server.stop());

    it('should be started', () => expectA200Ok(server));
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

    return server;
  }

  function expectA200Ok(server) {
    return fetch(server.getUrl()).then(res => expect(res.status).to.equal(200));
  }

  function expectAConnectionRefused(server) {
    return expect(fetch(server.getUrl())).to.be.rejectedWith('ECONNREFUSED');
  }
});