'use strict';
const testkit = require('..'),
  expect = require('chai').expect,
  request = require('request'),
  childProcessTestkit = require('wix-childprocess-testkit');

const port = childProcessTestkit.env.randomPort();

describe('wix bootstrap testkit', function () {
  this.timeout(30000);

  describe('getUrl/getManagementUrl/env', () => {
    const app = testkit.bootstrapApp('./test/app/index.js', {
      env: {
        PORT: port,
        MOUNT_POINT: '/qwe',
        MANAGEMENT_PORT: port + 4
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
      expect(app.env.PORT).to.equal(port);
      expect(app.env.MANAGEMENT_PORT).to.equal(port + 4);
      expect(app.env.MOUNT_POINT).to.equal('/qwe');
      expect(app.env.APP_NAME).to.equal('app');
    });
  });

  describe('defaults', () => {
    const app = testkit.bootstrapApp('./test/app/index.js');

    app.beforeAndAfter();

    it('should use default port/mount point', done => {
      request.get(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}`, (err, res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('custom env values', () => {
    const customEnv = {
      PORT: port,
      MOUNT_POINT: '/qwe'
    };
    const app = testkit.bootstrapApp('./test/app/index.js', {env: customEnv});

    app.beforeAndAfter();

    it('should start an app with custom env values', done => {
      request.get(`http://localhost:${customEnv.PORT}${customEnv.MOUNT_POINT}`, (err, res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });
});