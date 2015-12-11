'use strict';
const request = require('request'),
  expect = require('chai').expect,
  wixPatchServerResponse = require('..'),
  testkit = require('wix-http-testkit');

describe('patch-server-response', () => {

  describe('unpatch() should not emit x-before-flushing-headers event on', () => {
    const server = aServer('before-writing-headers');

    server.beforeAndAfter();
    beforeEach(() => wixPatchServerResponse.unpatch());

    it('send', done => {
      request.get(server.getUrl('send'), (error, response) => {
        expect(response.headers).to.not.have.property('x-before-flushing-headers');
        done();
      });
    });

    it('write', done => {
      request.get(server.getUrl('write'), (error, response) => {
        expect(response.headers).to.not.have.property('x-before-flushing-headers');
        done();
      });
    });

    it('redirect', done => {
      request.get(server.getUrl('redirect'), (error, response) => {
        expect(response.headers).to.not.have.property('x-before-flushing-headers');
        done();
      });
    });
    it('end', done => {
      request.get(server.getUrl('end'), (error, response) => {
        expect(response.headers).to.not.have.property('x-before-flushing-headers');
        done();
      });
    });
  });

  describe('patch() should emit x-before-writing-headers event on', () => {
    const server = aServer('x-before-flushing-headers');

    server.beforeAndAfter();
    beforeEach(() => wixPatchServerResponse.patch());

    it('send', done => {
      request.get(server.getUrl('send'), (error, response) => {
        expect(response.headers).to.have.property('x-before-flushing-headers');
        done();
      });
    });

    it('write', done => {
      request.get(server.getUrl('write'), (error, response) => {
        expect(response.headers).to.have.property('x-before-flushing-headers');
        done();
      });
    });

    it('redirect', done => {
      request.get(server.getUrl('redirect'), (error, response) => {
        expect(response.headers).to.have.property('x-before-flushing-headers');
        done();
      });
    });
    it('end', done => {
      request.get(server.getUrl('end'), (error, response) => {
        expect(response.headers).to.have.property('x-before-flushing-headers');
        done();
      });
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