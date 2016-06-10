'use strict';
const testkit = require('..'),
  expect = require('chai').expect,
  fetch = require('node-fetch'),
  shelljs = require('shelljs');

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

    it('should inject defaults for environment variables', () => {

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

  describe('APP_LOG_DIR', () => {
    const app = testkit.server('./test/app/index');

    afterEach(() => app.stop());

    it('should pre-create directory APP_LOG_DIR if it does not exist', () => {
      shelljs.rm('-rf', app.env['APP_LOG_DIR']);
      return app.start()
        .then(() => expect(shelljs.test('-d', app.env['APP_LOG_DIR'])).to.be.true);
    });

    it('should recreate APP_LOG_DIR between tests', () => {
      shelljs.rm('-rf', app.env['APP_LOG_DIR']);
      return app.start()
        .then(() => expect(shelljs.test('-d', app.env['APP_LOG_DIR'])).to.be.true);
    });
  });

  describe('APP_PERSISTENT_DIR', () => {
    const app = testkit.server('./test/app/index');

    afterEach(() => app.stop());

    it('should not recreate directory APP_PERSISTENT_DIR between runs', () => {
      shelljs.mkdir('-p', app.env['APP_PERSISTENT_DIR']);
      shelljs.echo('woop').to(app.env['APP_PERSISTENT_DIR'] + '/woop');
      return app.start()
        .then(() => expect(shelljs.test('-f', app.env['APP_PERSISTENT_DIR'] + '/woop')).to.be.true);
    });
  });

});