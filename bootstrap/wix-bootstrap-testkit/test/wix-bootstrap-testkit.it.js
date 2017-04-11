const testkit = require('..'),
  expect = require('chai').use(require('chai-as-promised')).expect,
  http = require('wnp-http-test-client'),
  shelljs = require('shelljs'),
  eventually = require('wix-eventually'),
  path = require('path');

process.env.BOO = 'wohoo';

describe('testkit', function () {
  this.timeout(30000);

  describe('testkit.server', () => {
    const app = testkit.server('./test/app', {env: {'MOUNT_POINT': '/'}}).beforeAndAfter();

    it('runs server in forked process and with cluster', () => {
      return http.okGet(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}info`).then(res => {
        expect(res.json().isWorker).to.equal(true);
        expect(res.json().pid).to.not.equal(process.pid);
      });
    });
  });

  describe('testkit.server for app module', () => {

    const appPath = path.resolve('./test/app-module');
    const app = testkit.server('index.js', { cwd: appPath }).beforeAndAfter();
    it('runs server from dependencies by providing cwd parameter', () => {
      return http.okGet(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/info`).then(res => {
        expect(res.json().pid).to.not.equal(process.pid);
      });
    });
  });

  describe('testkit.app', () => {
    const app = testkit.app('./test/app').beforeAndAfter();

    it('runs app in same process and without cluster', () => {
      return http.okGet(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/info`).then(res => {
        expect(res.json().isWorker).to.equal(false);
        expect(res.json().pid).to.equal(process.pid);
      });
    });
  });

  [
    { runner: 'server', pidCheck: pid => expect(pid).to.not.equal(`${process.pid}`), pidMsg: 'forked process' },
    { runner: 'app', pidCheck: pid => expect(pid).to.equal(`${process.pid}`), pidMsg: 'same process' }
  ].forEach(cfg => {
    const runner = opts => testkit[cfg.runner]('./test/app', opts);
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

        it('should be running for test', () => {
          return http.okGet(app.getUrl('/health/is_alive'));
        });

        it('should be running for another test', () => {
          return http.okGet(app.getUrl('/health/is_alive'))
        });
      });

      describe('beforeAndAfterEach', () => {
        const app = runner().beforeAndAfterEach();

        afterEach('stopped', () => {
          return expect(http(app.getUrl('/health/is_alive'))).to.eventually.be.rejected;
        });

        after('stopped', () => {
          return expect(http(app.getUrl('/health/is_alive'))).to.eventually.be.rejected;
        });

        it('should be running for test', () => {
          return http.okGet(app.getUrl('/health/is_alive'));
        });

        it('should be running for another test', () => {
          return http.okGet(app.getUrl('/health/is_alive'));
        });
      });


      describe('defaults', () => {
        const app = runner().beforeAndAfter();

        it('should use default port/mount point', () => {
          return http.okGet(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}`);
        });

        it('should use default port/mount point for management app', () => {
          return http.okGet(`http://localhost:${app.env.MANAGEMENT_PORT}${app.env.MOUNT_POINT}/health/deployment/test`);
        });

        it('should transfer current env onto launched app', () => {
          return http.okGet(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/env`)
            .then(res => expect(res.json()).to.contain.deep.property('BOO', 'wohoo'));
        });

        it('should capture combined stdout and stderr output', () => {
          return http.okGet(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/outerr`)
            .then(() => eventually(() => {
              expect(app.output).to.be.string('an err');
              expect(app.output).to.be.string('an out');
            }));
        });

        it('should capture app stderr', () => {
          return http.okGet(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/err`)
            .then(() => expect(app.output).to.be.string('an err'));
        });

        it('should capture app stdout', () => {
          return http.okGet(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/out`)
            .then(() => expect(app.output).to.be.string('an out'));
        });

        it(`should run on ${cfg.pidMsg}`, () => {
          http.okGet(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/pid`)
            .then(res => cfg.pidCheck(res.text()));
        });
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
