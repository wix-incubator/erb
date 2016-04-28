'use strict';
const fetch = require('node-fetch'),
  expect = require('chai').expect,
  envSupport = require('env-support'),
  testkit = require('wix-childprocess-testkit'),
  shelljs = require('shelljs'),
  join = require('path').join,
  fork = require('child_process').fork;

describe('wix-bootstrap-bi it', () => {
  const env = envSupport.bootstrap({APP_LOG_DIR: './target/logs'});

  before(() => {
    shelljs.rm('-rf', env.APP_LOG_DIR + '*');
    shelljs.mkdir('-p', env.APP_LOG_DIR);
  });

  describe('bootstrap plugin', () => {
    testkit
      .server('./test/apps/composer', {env: env}, testkit.checks.httpGet('/health/is_alive'))
      .beforeAndAfter();

    it('should log event to file', () => {
      return fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/bi/1`)
        .then(res => expect(res.status).to.equal(200))
        .then(() => {
          const loggedEvents = asEvents(resolveLogFile(env.APP_LOG_DIR, 'wix.bi.2'));
          expect(loggedEvents.pop().MESSAGE).to.deep.equal({src: 5, evtId: '1'});
        });
    });
  });

  describe('clustered', () => {

    it('should write to files per worker given running in clustered mode', done => {
      fork('./test/apps/clustered', {env}).on('exit', () => {
        expect(asEvents(resolveLogFile(env.APP_LOG_DIR, 'wix.bi.worker-1')).pop().MESSAGE).to.deep.equal({evtId: 1});
        expect(asEvents(resolveLogFile(env.APP_LOG_DIR, 'wix.bi.worker-2')).pop().MESSAGE).to.deep.equal({evtId: 2});
        done();
      });
    });
  });

  function resolveLogFile(logDir, logFilePrefix) {
    const logFiles = shelljs.ls(join(logDir, logFilePrefix) + '*');
    expect(logFiles.length).to.equal(1);
    return logFiles.pop();
  }

  function asEvents(logFile) {
    return shelljs.cat(logFile).split('\n').map(el => JSON.parse(el));
  }
});