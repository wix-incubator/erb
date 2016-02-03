'use strict';
const testkit = require('..'),
  expect = require('chai').expect,
  request = require('request');

process.env.BOO = 'wohoo';

describe('wix bootstrap testkit', function () {
  this.timeout(30000);

  describe('getUrl/getManagementUrl/env', () => {
    const app = testkit.bootstrapApp('./test/app/index.js');

    it('should return url matching env', () => {
      expect(app.getUrl()).to.equal(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}`);
    });

    it('should merge provided url with base url', () => {
      expect(app.getUrl('zzz')).to.equal(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/zzz`);
    });

    it('should return url matching env', () => {
      expect(app.getManagementUrl()).to.equal(`http://localhost:${app.env.MANAGEMENT_PORT}${app.env.MOUNT_POINT}`);
    });

    it('should merge provided url with base management url', () => {
      expect(app.getManagementUrl('zzz')).to.equal(`http://localhost:${app.env.MANAGEMENT_PORT}${app.env.MOUNT_POINT}/zzz`);
    });
  });

  describe('defaults', () => {
    const app = testkit
      .server('./test/app/index.js')
      .beforeAndAfter();

    it('should use default port/mount point', done => {
      request.get(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}`, (err, res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    it('should transfer current env onto launched app', done => {
      request.get(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/env`, (err, res, body) => {
        expect(res.statusCode).to.equal(200);
        expect(JSON.parse(body)).to.contain.deep.property('BOO', 'wohoo');
        done();
      });
    });
  });
});