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

    let strategy = cp.strategyBuilder()
                     .withType(cp.strategyTypes()
                                 .specificAge)
                     .withAge(2048);

    app.use(cp.withStrategy(strategy));

    app.get('/send', (req, res) => res.send('hi'));


    return server;
  }
});