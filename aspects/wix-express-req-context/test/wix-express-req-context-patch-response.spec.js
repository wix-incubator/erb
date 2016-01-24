'use strict';
const aServer = require('./drivers/request-context-driver').aServer,
  request = require('request'),
  expect = require('chai').expect;


describe('req context', function () {
  const server = aServer();

  server.beforeAndAfterEach();

  it('should return seen by header for any requqest', done => {
    request.get(server.getUrl('userIp'), (err, res) => {
      expect(res.headers['x-seen-by']).to.be.equal('seen-by-Kfir');
      done();
    });
  });

});