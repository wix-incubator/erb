'use strict';
const fetch = require('node-fetch'),
  chai = require('chai'),
  expect = chai.expect,
  testkit = require('..');

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

  function aServer() {
    let server = testkit.server();
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