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
    const app = testkit.bootstrapApp('./test/app/index.js');

    app.beforeAndAfter();

    it('should use default port/mount point', done => {
      request.get(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}`, (err, res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    it.only('should transfer current env onto launched app', done => {
      request.get(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/env`, (err, res, body) => {
        expect(res.statusCode).to.equal(200);
        expect(JSON.parse(body)).to.contain.deep.property('BOO', 'wohoo');
        done();
      });
    });

  });

  describe('beforeAndAfter', () => {
    const app = testkit.bootstrapApp('./test/app/index.js');

    app.beforeAndAfter();

    it('should have started a server', done => {
      request.get(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}`, (err, res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    after(done => {
      request.get(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}`, (err, res) => {
        expect(err).to.be.defined;
        done();
      });
    });
  });

  describe('start/stop with promises', () => {
    const app = testkit.bootstrapApp('./test/app/index.js');

    before(() => app.start());
    after(() => app.stop());

    it('should have started a server', done => {
      request.get(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}`, (err, res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    after(done => {
      request.get(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}`, (err, res) => {
        expect(err).to.be.defined;
        done();
      });
    });
  });

  describe('start/stop with callbacks', () => {
    const app = testkit.bootstrapApp('./test/app/index.js');

    before(done => app.start(done));
    after(done => app.stop(done));

    it('should have started a server', done => {
      request.get(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}`, (err, res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    after(done => {
      request.get(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}`, (err, res) => {
        expect(err).to.be.defined;
        done();
      });
    });
  });

});