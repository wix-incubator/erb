const fetch = require('node-fetch'),
  expect = require('chai').expect,
  wixPatchServerResponse = require('..'),
  testkit = require('wix-http-testkit');

describe('patch-server-response', () => {

  describe('unpatch() should not emit x-before-flushing-headers event on', () => {
    const server = aServer('before-writing-headers');

    server.beforeAndAfter();
    beforeEach(() => wixPatchServerResponse.unpatch());

    it('send', () => {
      return fetch(server.getUrl('send'))
        .then(res => expect(res.headers.raw()).to.not.have.property('x-before-flushing-headers'));
    });

    it('write', () => {
      return fetch(server.getUrl('write'))
        .then(res => expect(res.headers.raw()).to.not.have.property('x-before-flushing-headers'));
    });

    it('redirect', () => {
      return fetch(server.getUrl('redirect'))
        .then(res => expect(res.headers.raw()).to.not.have.property('x-before-flushing-headers'));
    });
    
    it('end', () => {
      return fetch(server.getUrl('end'))
        .then(res => expect(res.headers.raw()).to.not.have.property('x-before-flushing-headers'));
    });
  });

  describe('patch() should emit x-before-writing-headers event on', () => {
    const server = aServer('x-before-flushing-headers');

    server.beforeAndAfter();
    beforeEach(() => wixPatchServerResponse.patch());

    it('send', () => {
      return fetch(server.getUrl('send'))
        .then(res => expect(res.headers.raw()).to.have.property('x-before-flushing-headers'));
    });

    it('write', () => {
      return fetch(server.getUrl('write'))
        .then(res => expect(res.headers.raw()).to.have.property('x-before-flushing-headers'));
    });

    it('redirect', () => {
      return fetch(server.getUrl('redirect'))
        .then(res => expect(res.headers.raw()).to.have.property('x-before-flushing-headers'));
    });
    
    it('end', () => {
      return fetch(server.getUrl('end'))
        .then(res => expect(res.headers.raw()).to.have.property('x-before-flushing-headers'));
    });
  });

  function aServer(header) {
    const server = testkit.server();
    const app = server.getApp();

    app.use((req, res, next) => {
      res.on(header, () => res.append(header, 'triggered'));
      next();
    });
    
    app.get('/write', (req, res) => {
      res.write('hi');
      res.end();
    });

    app.get('/send', (req, res) => res.send('hi'));
    app.get('/redirect', (req, res) => res.redirect('/bla'));
    app.get('/end', (req, res) => res.end('bla'));

    return server;
  }
});
