'use strict';
const fetch = require('node-fetch'),
  expect = require('chai').expect,
  wixDomainMiddleware = require('..'),
  wixDomain = require('wix-domain'),
  testkit = require('wix-http-testkit');

describe('wix-express-domain', () => {
  let server = aServer();

  server.beforeAndAfter();

  it('should track request with wix-domain in sync request handler', () =>
    get('/sync', 'syncParam').then(res => expect(res).to.equal('syncParam')));

  it('should track request with wix-domain in async request handler', () =>
    get('/async', 'asyncParam').then(res => expect(res).to.equal('asyncParam')));

  it('should track request with wix-domain in promisified request handler', () =>
    get('/promise', 'promisifiedParam').then(res => expect(res).to.equal('promisifiedParam')));

  function get(path, queryParam) {
    return fetch(server.getUrl(`${path}?q=${queryParam}`)).then(res => {
      expect(res.ok).to.be.true;
      return res.text();
    });
  }
});

function aServer() {
  const server = testkit.server();
  const app = server.getApp();

  app.use(wixDomainMiddleware);
  app.use((req, res, next) => {
    wixDomain.get().someKey = req.query.q;
    next();
  });

  app.get('/sync', (req, res) => res.send(wixDomain.get().someKey));
  app.get('/async', (req, res) => process.nextTick(() => res.send(wixDomain.get().someKey)));
  app.get('/promise', (req, res) => new Promise(resolve => res.send(wixDomain.get().someKey)));

  return server;
}