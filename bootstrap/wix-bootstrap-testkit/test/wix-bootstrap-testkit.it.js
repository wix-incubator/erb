'use strict';
const testkit = require('..'),
  expect = require('chai').expect,
  fetch = require('node-fetch'),
  shelljs = require('shelljs');

process.env.BOO = 'wohoo';

describe('composer testkit', function () {
  this.timeout(30000);

  [{name: 'bootstrap-ng-app', runner: 'server', app: './test/app'},
    {name: 'bootstrap-ng embedded app', runner: 'app', app: require('./app/app')}]
    .forEach(cfg => {
      const runner = () => testkit[cfg.runner](cfg.app);
      describe(cfg.name, () => {

        describe('getUrl/getManagementUrl/env', () => {
          const app = runner();

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
          const app = runner().beforeAndAfter();

          it('should use default port/mount point', () =>
            fetch(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}`)
              .then(res => expect(res.status).to.equal(200))
          );

          it('should use default port/mount point for management app', () =>
            fetch(`http://localhost:${app.env.MANAGEMENT_PORT}${app.env.MOUNT_POINT}/health/deployment/test`)
              .then(res => expect(res.status).to.equal(200))
          );

          it('should transfer current env onto launched app', () =>
            fetch(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/env`)
              .then(res => res.json())
              .then(json => expect(json).to.contain.deep.property('BOO', 'wohoo'))
          );

          it('should capture combined stdout and stderr output', () =>
            fetch(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/outerr`)
              .then(res => expect(res.ok).to.equal(true))
              .then(() => {
                expect(app.output).to.be.string('an err');
                expect(app.output).to.be.string('an out');
              })
          );

          it('should capture app stdout', () =>
            fetch(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/err`)
              .then(res => expect(res.ok).to.equal(true))
              .then(() => expect(app.output).to.be.string('an err'))
          );

          it('should capture app stdout', () =>
            fetch(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/out`)
              .then(res => expect(res.ok).to.equal(true))
              .then(() => expect(app.output).to.be.string('an out'))
          );
        });

        describe('APP_LOG_DIR', () => {
          const app = runner();

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
          const app = runner();

          afterEach(() => app.stop());

          it('should not recreate directory APP_PERSISTENT_DIR between runs', () => {
            shelljs.mkdir('-p', app.env['APP_PERSISTENT_DIR']);
            shelljs.echo('woop').to(app.env['APP_PERSISTENT_DIR'] + '/woop');
            return app.start()
              .then(() => expect(shelljs.test('-f', app.env['APP_PERSISTENT_DIR'] + '/woop')).to.be.true);
          });
        });
      });
    });
});