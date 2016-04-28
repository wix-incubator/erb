'use strict';
const chai = require('chai'),
  expect = chai.expect,
  testkit = require('..'),
  net = require('net'),
  rp = require('request-promise'),
  envSupport = require('env-support'),
  intercept = require('intercept-stdout');

chai.use(require('chai-as-promised'));

describe('wix-childprocess-testkit', function () {
  this.timeout(10000);
  let server, env = envSupport.basic(), stdout, detach;

  beforeEach(() => {
    stdout = '';
    detach = intercept(txt => {
      stdout += txt;
    });
  });

  afterEach(() => {
    env = envSupport.basic();
    detach();
    if (server && server.isRunning) {
      return server.stop();
    }
  });

  describe('startup', () => {

    it('should support executing script provided as relative to cwd', () => {
      server = testkit.server('test/apps/app-http', {env: env}, testkit.checks.httpGet('/test'));
      return server.start();
    });

    it('should support executing script provided as absolute path', () => {
      server = testkit.server(process.cwd() + '/test/apps/app-http', {env: env}, testkit.checks.httpGet('/test'));
      return server.start();
    });

    it('should detect a blocked/dead child and kill spawned process', done => {
      server = testkit.server('./test/apps/blocked-event-loop', {
        timeout: 500,
        env: env
      }, testkit.checks.stdOut('spawned'));

      server.start(() => {
        const interval = setInterval(() => {
          try {
            process.kill(server.child().pid, 0);
          } catch (e) {
            clearInterval(interval);
            expect(stdout).to.be.string('Did not receive "ping" from child');
            done();
          }
        }, 500);
        interval.unref();
      });
    });

    it('should fail startup if process exited during doStart()', () => {
      server = testkit.server('./test/apps/clean-exit-on-start', {
        timeout: 500,
        env: env
      }, testkit.checks.stdOut('spawned'));

      return expect(server.start()).to.be.rejectedWith('Program exited during startup with code: 0');
    });

    it('should fail startup if process failed during doStart()', () => {
      server = testkit.server('./test/apps/error-on-start', {
        timeout: 500,
        env: env
      }, testkit.checks.stdOut('spawned'));

      return expect(server.start()).to.be.rejectedWith('Program exited during startup with code: 1');
    });

    it('should fail startup if process failed with error during doStart()', () => {
      server = testkit.server('./test/apps/errored-exit-on-start', {
        timeout: 500,
        env: env
      }, testkit.checks.stdOut('spawned'));

      return expect(server.start()).to.be.rejectedWith('Program exited during startup with code: 255');
    });

    //TODO: figure out the way to get this effect - someday
    //it.only('should detect that parent process died and suicide', done => {
    //  const child = childProcess.fork('test/apps/testkit-to-fork', {env: {PORT: env.PORT}});
    //  setTimeout(() => {
    //    aSuccessGet('/test')
    //      .then(() => {
    //        child.kill('SIGTERM');
    //        return aSuccessGet('/test');
    //      })
    //      .then(() => done())
    //      .catch(err => done(err));
    //  }, 2000);
    //});

    it('should transfer environment from system onto child app', () => {
      process.env.BOO = 'wohoo';
      anApp('app-http').start()
        .then(() => aSuccessGet('/env'))
        .then(res => {
          expect(JSON.parse(res)).to.contain.deep.property('BOO', 'wohoo');
        });
    });

    it('should transfer explicit environment onto child app', () => {
      anApp('app-http', {env: {WOOP: 'dadoop'}}).start()
        .then(() => aSuccessGet('/env'))
        .then(res => {
          expect(JSON.parse(res)).to.contain.deep.property('WOOP', 'dadoop');
        });
    });

    it('should transfer explicit execArgv onto child app', () => {
      anApp('app-http', {execArgv: ['--debug']}).start()
        .then(() => aSuccessGet('/env'))
        .then(res => {
          expect(JSON.parse(res)).to.deep.equal('--debug');
        });
    });

    it('should respect provided timeout', () =>
      expect(anApp('app-timeout-2000', {timeout: 1000}).start()).to.be.rejectedWith('Timeout of 1000 exceeded while waiting for embedded app')
    );

    it('should expose stdout/stderr', () =>
      anApp('app-log').start().then(() => {
        expect(server.stderr().pop()).to.contain('error log');
        expect(server.stdout().pop()).to.contain('info log');
      })
    );

    it('should emit callback with error if embedded app fails', () =>
      anApp('app-throw').start()
        .then(() => failOnNoError())
        .catch(err => expect(err).to.be.instanceof(Error))
        .then(() => new Promise(resolve => setTimeout(resolve(), 500)))
        .then(() => verifyNotListening(env))
    );
  });

  function failOnNoError() {
    throw new Error('error expected, but got into "then"...');
  }

  function verifyNotListening(env) {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();

      client.on('error', () => resolve());

      client.connect({port: env.PORT}, () => {
        client.end();
        reject(Error('expected connect failure, but could connect on port: ' + env.PORT));
      });
    });
  }

  function anApp(app, opts) {
    server = testkit.server(`./test/apps/${app}`, Object.assign({}, opts, {env}), testkit.checks.httpGet('/test'));
    return server;
  }

  function aSuccessGet(path) {
    const effectivePath = path || '';
    return rp(`http://localhost:${env.PORT}${env.MOUNT_POINT}${effectivePath}`);
  }
});
