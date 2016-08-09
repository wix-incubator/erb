'use strict';
const testkit = require('..'),
  expect = require('chai').use(require('chai-as-promised')).expect,
  http = require('wnp-http-test-client'),
  shelljs = require('shelljs');

process.env.BOO = 'wohoo';

describe('composer testkit', function () {
  this.timeout(30000);

  [
    {runner: 'server', app: './test/apps/server', pidCheck: pid => expect(pid).to.not.equal(`${process.pid}`), pidMsg: 'forked process'},
    {runner: 'app', app: './test/apps/server', pidCheck: pid => expect(pid).to.equal(`${process.pid}`), pidMsg: 'same process'},
    {runner: 'fn', app: require('./apps/embedded/app'), pidCheck: pid => expect(pid).to.equal(`${process.pid}`), pidMsg: 'same process'}
  ].forEach(cfg => {
    const runner = opts => testkit[cfg.runner](cfg.app, opts);
    describe(cfg.runner, () => {

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

      describe('beforeAndAfter', () => {
        const app = runner().beforeAndAfter();
        afterEach('running', () => http.okGet(app.getUrl('/health/is_alive')));
        after('stopped', () => expect(http(app.getUrl('/health/is_alive'))).to.eventually.be.rejected);

        it('should be running for test', () => http.okGet(app.getUrl('/health/is_alive')));

        it('should be running for another test', () => http.okGet(app.getUrl('/health/is_alive')));
      });

      describe('beforeAndAfterEach', () => {
        const app = runner().beforeAndAfterEach();

        afterEach('stopped', () => expect(http(app.getUrl('/health/is_alive'))).to.eventually.be.rejected);
        after('stopped', () => expect(http(app.getUrl('/health/is_alive'))).to.eventually.be.rejected);

        it('should be running for test', () => http.okGet(app.getUrl('/health/is_alive')));

        it('should be running for another test', () => http.okGet(app.getUrl('/health/is_alive')));
      });


      describe('defaults', () => {
        const app = runner().beforeAndAfter();

        it('should use default port/mount point', () =>
          http.okGet(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}`));

        it('should use default port/mount point for management app', () =>
          http.okGet(`http://localhost:${app.env.MANAGEMENT_PORT}${app.env.MOUNT_POINT}/health/deployment/test`));

        it('should transfer current env onto launched app', () =>
          http.okGet(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/env`)
            .then(res => expect(res.json()).to.contain.deep.property('BOO', 'wohoo'))
        );

        it('should capture combined stdout and stderr output', () =>
          http.okGet(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/outerr`)
            .then(() => {
              expect(app.output).to.be.string('an err');
              expect(app.output).to.be.string('an out');
            })
        );

        it('should capture app stderr', () =>
          http.okGet(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/err`)
            .then(() => expect(app.output).to.be.string('an err'))
        );

        it('should capture app stdout', () =>
          http.okGet(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/out`)
            .then(() => expect(app.output).to.be.string('an out'))
        );

        it(`should run on ${cfg.pidMsg}`, () =>
          http.okGet(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/pid`)
            .then(res => cfg.pidCheck(res.text()))
        );
      });

      describe('log dir', () => {
        const app = runner();

        afterEach(() => app.stop());

        it('should pre-create default log dir if it does not exist', () => {
          shelljs.rm('-rf', app.env.APP_LOG_DIR);
          return app.start()
            .then(() => expect(shelljs.test('-d', app.env.APP_LOG_DIR)).to.be.true);
        });

        it('should recreate log dir between tests', () => {
          shelljs.rm('-rf', app.env.APP_LOG_DIR);
          return app.start()
            .then(() => expect(shelljs.test('-d', app.env.APP_LOG_DIR)).to.be.true);
        });
      });

    });
  });
});