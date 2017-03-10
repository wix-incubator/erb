const expect = require('chai').expect,
  testkit = require('..'),
  shelljs = require('shelljs'),
  fs = require('fs');

describe('wix-log-file-testkit', () => {
  const logDir = './target/logs';

  beforeEach(() => {
    shelljs.rm('-rf', logDir);
    shelljs.mkdir('-p', logDir);
  });

  it('should detect changes in files', () => {
    const watcher = testkit.interceptor(logDir + '/*.log');

    return watcher.start()
      .then(() => expect(watcher.captured).to.equal(''))
      .then(() => fs.writeFileSync(logDir + '/one.log', 'one'))
      .then(() => expect(watcher.captured).to.equal('one'))
      .then(() => fs.writeFileSync(logDir + '/two.log', 'two'))
      .then(() => expect(watcher.captured).to.equal('onetwo'))
      .then(() => watcher.stop())
      .catch(e => {
        watcher.stop();
        return Promise.reject(e);
      });
  });

  it('should ignore files that do not match provided pattern', () => {
    const watcher = testkit.interceptor(logDir + '/*.log');

    return watcher.start()
      .then(() => expect(watcher.captured).to.equal(''))
      .then(() => fs.writeFileSync(logDir + '/one.logz', 'one'))
      .then(() => fs.writeFileSync(logDir + '/two.log', 'two'))
      .then(() => expect(watcher.captured).to.equal('two'))
      .then(() => watcher.stop())
      .catch(e => {
        watcher.stop();
        return Promise.reject(e);
      });
  });

  it('should ignore log files/content before starting', () => {
    const watcher = testkit.interceptor(logDir + '/*.log');

    fs.writeFileSync(logDir + '/one.log', 'one');

    return watcher.start()
      .then(() => expect(watcher.captured).to.equal(''))
      .then(() => fs.writeFileSync(logDir + '/two.log', 'two'))
      .then(() => expect(watcher.captured).to.equal('two'))
      .then(() => watcher.stop())
      .catch(e => {
        watcher.stop();
        return Promise.reject(e);
      });
  });

  it('should ignore log files/content after stopping', () => {
    const watcher = testkit.interceptor(logDir + '/*.log');

    return watcher.start()
      .then(() => fs.writeFileSync(logDir + '/two.log', 'two'))
      .then(() => expect(watcher.captured).to.equal('two'))
      .then(() => watcher.stop())
      .then(() => fs.writeFileSync(logDir + '/three.log', 'three'))
      .then(() => expect(watcher.captured).to.equal('two'));
  });

  it('should memorize log file content between start/stops and should not return it', () => {
    const watcher = testkit.interceptor(logDir + '/*.log');

    return watcher.start()
      .then(() => fs.writeFileSync(logDir + '/one.log', 'one'))
      .then(() => expect(watcher.captured).to.equal('one'))
      .then(() => watcher.stop())
      .then(() => watcher.start())
      .then(() => expect(watcher.captured).to.equal(''))
      .then(() => fs.writeFileSync(logDir + '/two.log', 'two'))
      .then(() => expect(watcher.captured).to.equal('two'))
      .then(() => watcher.stop())
      .catch(e => {
        watcher.stop();
        return Promise.reject(e);
      });
  });

});
