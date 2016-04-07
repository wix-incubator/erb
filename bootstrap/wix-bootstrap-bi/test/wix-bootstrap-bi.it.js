'use strict';
const expect = require('chai').expect,
  bootstrapBi = require('..'),
  shelljs = require('shelljs'),
  join = require('path').join,
  fork = require('child_process').fork;

describe('wix-bootstrap-bi it', () => {

  describe('file-backed logger', () => {
    const logDir = './target/logs';

    before(() => {
      shelljs.rm('-rf', logDir + '*');
      shelljs.mkdir('-p', logDir);
    });

    it('should log event to file', () => {
      const logger = bootstrapBi(stubBootstrapContext(logDir)).logger(aspectStore());
      return logger.log({evtId: 1}).then(() => {
        const loggedEvents = asEvents(resolveLogFile(logDir, 'wix.bi.2'));
        expect(loggedEvents.pop().MESSAGE).to.deep.equal({evtId: 1});
      });
    });

    it('should produce factories per log directory', () => {
      const anotherLogDir = logDir + '-another';
      shelljs.mkdir('-p', anotherLogDir);

      const defaultLogger = bootstrapBi(stubBootstrapContext(logDir)).logger(aspectStore());
      const anotherLogger = bootstrapBi(stubBootstrapContext(anotherLogDir)).logger(aspectStore());
      return Promise.all([defaultLogger.log({evtId: 1}), anotherLogger.log({evtId: 2})]).then(() => {
        expect(asEvents(resolveLogFile(logDir, 'wix.bi.2')).pop().MESSAGE).to.deep.equal({evtId: 1});
        expect(asEvents(resolveLogFile(anotherLogDir, 'wix.bi.2')).pop().MESSAGE).to.deep.equal({evtId: 2});
      });
    });

    it('should write to files per worker given running in clustered mode', done => {
      fork('./test/apps/clustered.js', {env: {LOG_DIR: logDir}}).on('exit', () => {
        expect(asEvents(resolveLogFile(logDir, 'wix.bi.worker-1')).pop().MESSAGE).to.deep.equal({evtId: 1});
        expect(asEvents(resolveLogFile(logDir, 'wix.bi.worker-2')).pop().MESSAGE).to.deep.equal({evtId: 2});
        done();
      });
    });
  });

  function stubBootstrapContext(logDir) {
    return {
      env: {
        logDir: logDir
      },
      app: {
        artifactName: 'test-app-name'
      }
    };
  }

  function aspectStore() {
    return {};
  }

  function resolveLogFile(logDir, logFilePrefix) {
    const logFiles = shelljs.ls(join(logDir, logFilePrefix) + '*');
    expect(logFiles.length).to.equal(1);
    return logFiles.pop();
  }

  function asEvents(logFile) {
    return shelljs.cat(logFile).split('\n').map(el => JSON.parse(el));
  }
});