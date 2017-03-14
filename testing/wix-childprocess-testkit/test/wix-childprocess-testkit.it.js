const expect = require('chai').use(require('chai-as-promised')).expect,
  testkit = require('..'),
  net = require('net'),
  fetch = require('node-fetch'),
  envSupport = require('env-support'),
  utils = require('./utils'),
  eventually = require('wix-eventually'),
  path = require('path');

describe('wix-childprocess-testkit it', function () {
  this.timeout(40000);
  let server;
  const env = envSupport.basic();

  afterEach(() => {
    if (server && server.isRunning) {
      return server.stop().catch(() => {});
    }
  });

  it('should support running any cmd line app', () => {
    server = testkit.spawn(['bash', '-c', 'echo go && read'], {env: env}, testkit.checks.stdErrOut('go'));
    return server.start();
  });

  it('should support executing script provided as relative to cwd', () => {
    server = testkit.fork('test/apps/app-http', {env: env}, testkit.checks.httpGet('/test'));
    return server.start();
  });

  it('toggle isRunning flag based on app state', () => {
    server = testkit.fork('test/apps/app-http', {env: env}, testkit.checks.httpGet('/test'));
    return Promise.resolve()
      .then(() => expect(server.isRunning).to.equal(false))
      .then(() => server.start())
      .then(() => expect(server.isRunning).to.equal(true))
      .then(() => server.stop())
      .then(() => expect(server.isRunning).to.equal(false));
  });


  it('should support executing script provided as absolute path', () => {
    server = testkit.fork(process.cwd() + '/test/apps/app-http', {env: env}, testkit.checks.httpGet('/test'));
    return server.start();
  });

  it('should support sending signals to forked processes', () => {
    server = testkit.fork(process.cwd() + '/test/apps/app-http', {env: env}, testkit.checks.httpGet('/test'));
    return server
      .start()
      .then(() => server.kill('SIGTERM'))
      .then(() => eventually(() => expect(server.output).to.contain('SIGTERM received by child process')));
  });

  it('should fail startup if process exited during doStart()', () => {
    server = testkit.fork('./test/apps/clean-exit-on-start', {
      timeout: 500,
      env: env
    }, testkit.checks.stdErrOut('spawned'));

    return expect(server.start()).to.be.rejectedWith('Program exited during startup with code: 0');
  });

  it('should fail startup if process failed during doStart()', () => {
    server = testkit.fork('./test/apps/error-on-start', {
      timeout: 500,
      env: env
    }, testkit.checks.stdErrOut('spawned'));

    return expect(server.start()).to.be.rejectedWith('Program exited during startup with code: 1');
  });

  it('should fail startup if process failed with error during doStart()', () => {
    server = testkit.fork('./test/apps/errored-exit-on-start', {
      timeout: 500,
      env: env
    }, testkit.checks.stdErrOut('spawned'));

    return expect(server.start()).to.be.rejectedWith('Program exited during startup with code: 255');
  });

  it('should kill process when process booted, but start-up test fails', () => {
    const server = testkit.fork('test/apps/app-http', {
      env: env,
      timeout: 2000
    }, testkit.checks.httpGet('/non-existent'));

    return Promise.resolve()
      .then(() => expect(server.start()).to.eventually.be.rejected)
      .then(() => utils.expectProcessesToNotBeAlive(server.child.pid));
  });

  it('should detect that parent process died and suicide', () => {
    let parentOfChildPid, childPid;
    return anApp('testkit-to-fork').start()
      .then(() => parentOfChildPid = server.child.pid)
      .then(() => aSuccessGet('/pid'))
      .then(res => childPid = JSON.parse(res).pid)
      .then(() => expect(childPid).to.not.equal(parentOfChildPid))
      .then(() => utils.killProcess(parentOfChildPid))
      .then(() => utils.expectProcessesToNotBeAlive(parentOfChildPid, childPid));
  });

  it('should transfer environment from system onto child app', () => {
    process.env.BOO = 'wohoo';
    return anApp('app-http').start()
      .then(() => aSuccessGet('/env'))
      .then(res => expect(JSON.parse(res)).to.contain.property('BOO', 'wohoo'));
  });

  it('should transfer explicit environment onto child app', () => {
    const anEnv = Object.assign({}, env, {WOOP: 'dadoop'});
    return anApp('app-http', {env: anEnv}).start()
      .then(() => aSuccessGet('/env'))
      .then(res => expect(JSON.parse(res)).to.contain.deep.property('WOOP', 'dadoop'));
  });

  it('should respect provided timeout', () => {
    server = testkit.fork('./test/apps/app-timeout-4000', {timeout: 500}, testkit.checks.stdErrOut('started ok'));

    return expect(server.start())
      .to.eventually.be.rejectedWith('Alive check failed within timeout of 500');
  });

  it('should expose stdout/stderr', () => {
    return anApp('app-log').start().then(() => {
      expect(server.output).to.contain('error log');
      expect(server.output).to.contain('info log');
    });
  });

  it('should emit callback with error if embedded app fails', () => {
    return anApp('app-throw').start()
      .then(() => failOnNoError())
      .catch(err => expect(err).to.be.instanceof(Error))
      .then(() => new Promise(resolve => setTimeout(resolve(), 500)))
      .then(() => verifyNotListening(env));
  });

  it('should support cwd param to forked processes', () => {
    const server = testkit.fork('app-http', Object.assign({}, {cwd: './test/apps'}, {env}), testkit.checks.httpGet('/test'));
    return server.start()
      .then(() => aSuccessGet('/cwd'))
      .then(res => {
        expect(JSON.parse(res)).to.deep.equal(path.resolve('./test/apps'));
      });
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

  function anApp(app, opts = {env}) {
    server = testkit.fork(`./test/apps/${app}`, opts, testkit.checks.httpGet('/test'));
    return server;
  }

  function aSuccessGet(path) {
    const effectivePath = path || '';
    return fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}${effectivePath}`)
      .then(res => {
        expect(res.status).to.equal(200);
        return res.text();
      });
  }
});
