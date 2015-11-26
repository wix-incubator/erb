'use strict';
const testkit = require('..'),
  expect = require('chai').expect,
  request = require('request');

describe('wix bootstrap testkit', function () {
  this.timeout(30000);

  describe('getUrl/getManagementUrl/env', () => {
    const app = testkit.bootstrapApp('./test/app/index.js', {
      env: {
        PORT: 3001,
        MOUNT_POINT: '/qwe',
        MANAGEMENT_PORT: 3002
      }
    });

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

    it('should merge provided env with defaults', () => {
      expect(app.env).to.deep.equal({
        PORT: 3001,
        MANAGEMENT_PORT: 3002,
        MOUNT_POINT: '/qwe',
        APP_NAME: 'app'
      });
    });
  });

  describe('defaults', () => {
    const app = testkit.bootstrapApp('./test/app/index.js');

    app.beforeAndAfter();

    it('should use default port/mount point', done => {
      request.get('http://localhost:3000/app', (err, res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('custom env values', () => {
    const app = testkit.bootstrapApp('./test/app/index.js', {
      env: {
        PORT: 3001,
        MOUNT_POINT: '/qwe'
      }
    });

    app.beforeAndAfter();

    it('should start an app with custom env values', done => {
      request.get('http://localhost:3001/qwe', (err, res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });
});