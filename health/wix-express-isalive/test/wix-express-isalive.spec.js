'use strict';
const request = require('request'),
  expect = require('chai').expect,
  testkit = require('wix-http-testkit'),
  expressIsAlive = require('../');

describe('wix health is alive', () => {
  const server = aServer();

  server.beforeAndAfter();

  it('respond with status: 200 and payload: "Alive"', done => {
    request.get(server.getUrl('health/is_alive'), (err, res) => {
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.equal('Alive');
      done();
    });
  });

  function aServer() {
    const server = testkit.server();
    expressIsAlive.addTo(server.getApp());
    return server;
  }
});