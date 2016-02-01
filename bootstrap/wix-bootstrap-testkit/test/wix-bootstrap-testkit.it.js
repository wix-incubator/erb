'use strict';
const testkit = require('..'),
  expect = require('chai').expect,
  fetch = require('node-fetch');

process.env.BOO = 'wohoo';

describe('wix bootstrap testkit', function () {
  this.timeout(30000);

  describe('getUrl/getManagementUrl/env', () => {
    const app = testkit.server('./test/app/index');

    it('should return url matching env', () => {
      expect(app.getUrl()).to.equal(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/`);
    });

    it('should merge provided url with base url', () => {
      expect(app.getUrl('zzz')).to.equal(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/zzz`);
    });

    it('should return url matching env', () => {
      expect(app.getManagementUrl()).to.equal(`http://localhost:${app.env.MANAGEMENT_PORT}${app.env.MOUNT_POINT}/`);
    });

    it('should merge provided url with base management url', () => {
      expect(app.getManagementUrl('/zzz')).to.equal(`http://localhost:${app.env.MANAGEMENT_PORT}${app.env.MOUNT_POINT}/zzz`);
    });
  });

  describe('defaults', () => {
    const app = testkit.server('./test/app/index').beforeAndAfter();

    it('should use default port/mount point', () =>
      fetch(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}`)
        .then(res => expect(res.status).to.equal(200))
    );

    it('should use default port/mount point for management app', () =>
      fetch(`http://localhost:${app.env.MANAGEMENT_PORT}${app.env.MOUNT_POINT}/app-info`)
        .then(res => expect(res.status).to.equal(200))
    );

    it('should transfer current env onto launched app', () =>
      fetch(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/env`)
        .then(res => res.json())
        .then(json => expect(json).to.contain.deep.property('BOO', 'wohoo'))
    );
  });
});