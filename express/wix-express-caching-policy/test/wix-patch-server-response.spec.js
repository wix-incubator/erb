'use strict';
const request = require('request'),
  chai = require('chai'),
  cp = require('..'),
  testkit = require('wix-http-testkit');

describe('chaching policy', () => {

  chai.use(matchers);
  let expect = chai.expect;

  let server = aServer();
  server.beforeAndAfterEach();

  it('should return no cache for default', done => {
    request.get(server.getUrl('/default'), (err, res) =>{
      expect(res.headers).to.haveHeaders({pragma: 'no-cache', 'cache-control': 'no-cache'});
      done();
    });
  });

  it('should return specific age', done => {
    request.get(server.getUrl('/specific'), (err, res) =>{
      expect(res.headers).to.haveHeaders({'cache-control': 'max-age=1000'});
      expect(res.headers).to.notHaveHeader(['pragma']);
      done();
    });
  });

  it('should return infinite', done => {
    request.get(server.getUrl('/infinite'), (err, res) =>{
      expect(res.headers).to.haveHeaders({'cache-control': 'max-age=2419200'});
      expect(res.headers).to.notHaveHeader(['pragma']);
      done();
    });
  });

  it('should return no cache headers', done => {
    request.get(server.getUrl('/noHeaders'), (err, res) =>{
      expect(res.headers).to.notHaveHeader(['pragma', 'cache-control']);
      done();
    });
  });

  it('should return noCache', done => {
    request.get(server.getUrl('/noCache'), (err, res) =>{
      expect(res.headers).to.haveHeaders({pragma: 'no-cache', 'cache-control': 'no-cache'});
      done();
    });
  });


  function matchers(chai) {
    chai.Assertion.addMethod('haveHeaders', haveHeaders);
    chai.Assertion.addMethod('notHaveHeader', notHaveHeader);

    function haveHeaders(haveHeaders) {
      var headers = this._obj;
      for(var h in haveHeaders){
        new chai.Assertion(headers[h]).to.be.eql(haveHeaders[h]);
      }
    }

    function notHaveHeader(notHaveHeaders) {
      var headers = this._obj;
      notHaveHeaders.forEach(h => {
        new chai.Assertion(headers[h]).to.be.undefined;
      });
    }
  }


  function aServer() {
    const server = testkit.server();
    const app = server.getApp();
    const wixPatchServerResponse = require('wix-patch-server-response');
    wixPatchServerResponse.patch();


    app.use('/', cp.defaultStrategy());
    app.use('/default', cp.defaultStrategy());
    app.use('/specific', cp.specific(1000));
    app.use('/infinite', cp.infinite());
    app.use('/noHeaders', cp.noHeaders());
    app.use('/noCache', cp.noCache());

    app.get('/default', (req, res) => res.send('ok'));
    app.get('/specific', (req, res) => res.send('ok'));
    app.get('/infinite', (req, res) => res.send('ok'));
    app.get('/noHeaders', (req, res) => res.send('ok'));
    app.get('/noCache', (req, res) => res.send('ok'));


    return server;
  }
});