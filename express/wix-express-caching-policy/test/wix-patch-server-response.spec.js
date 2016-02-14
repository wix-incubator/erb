'use strict';
const request = require('request'),
  expect = require('chai').expect,
  cp = require('..'),
  testkit = require('wix-http-testkit');

describe('chaching policy', () => {

  let server = aServer();
  server.beforeAndAfterEach();

  it('bla bla', done => {
    request.get(server.getUrl('/send'), (err, res) =>{
      expect(res.statusCode).to.equal(200);
      done();
    });
  });



  function aServer() {
    const server = testkit.server();
    const app = server.getApp();

    app.use('/defult', cp.default());
    app.use('/specific', cp.specific(1000));
    app.use('/maxAge', cp.maxAge());
    app.use('/noHeaders', cp.noHeaders());
    app.use('/infinite', cp.infinite());

    app.get('/specific', (req, res) => res.send('ok'));
    app.get('/maxAge', (req, res) => res.send('ok'));
    app.get('/noHeaders', (req, res) => res.send('ok'));
    app.get('/infinite', (req, res) => res.send('ok'));


    return server;
  }
});