'use strict';
const expect = require('chai').expect,
  testkit = require('wnp-bootstrap-composer-testkit'),
  http = require('wnp-http-test-client'),
  shelljs = require('shelljs'),
  join = require('path').join,
  fork = require('child_process').fork;

describe('wix-bootstrap-bi it', () => {
  const env = {APP_LOG_DIR: './target/logs'};

  before(() => {
    shelljs.rm('-rf', env.APP_LOG_DIR + '*');
    shelljs.mkdir('-p', env.APP_LOG_DIR);
  });

  describe('bootstrap plugin', () => {
    const app = testkit.server('./test/apps/composer', {env}).beforeAndAfter();

    it('should log event to file', () =>
      http.okGet(app.getUrl('/bi/1')).then(() => {
        const loggedEvents = asEvents(resolveLogFile(env.APP_LOG_DIR, 'wix.bi.2'));
        expect(loggedEvents.pop().MESSAGE).to.deep.equal({src: 5, evtId: '1'});
      })
    );
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
    return shelljs.cat(logFile)
      .split('\n')
      .filter(el => el !== '')
      .map(el => JSON.parse(el));
  }
});