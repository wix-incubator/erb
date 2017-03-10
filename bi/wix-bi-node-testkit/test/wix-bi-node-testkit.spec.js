const expect = require('chai').expect,
  testkit = require('..'),
  biSupport = require('wnp-bi-node-support'),
  biClient = require('wix-bi-logger-client'),
  shelljs = require('shelljs');

describe('bi logger node testkit', () => {

  afterEach(() => delete process.env.APP_LOG_DIR);

  describe('defaults', () => {
    const logDir = './target/logs';
    const interceptor = testkit.interceptor().beforeAndAfterEach();

    beforeEach(() => shelljs.rm('-rf', logDir + '/wix.bi*.log'));

    it('should return logged bi events', () => {
      const logger = biLoggerFactory(logDir, {});

      return logger.log({evtId: 5}).then(() => {
        expect(interceptor.events.pop()).to.contain.deep.property('evtId', 5);
      });
    });
  });

  describe('custom log dir via parameter', () => {
    const logDir = './target/logs-custom';
    const interceptor = testkit.interceptor(logDir).beforeAndAfterEach();

    beforeEach(() => shelljs.rm('-rf', logDir + '/wix.bi*.log'));

    it('should return logged bi events', () => {
      const logger = biLoggerFactory(logDir, {});

      return logger.log({evtId: 5}).then(() => {
        expect(interceptor.events.pop()).to.contain.deep.property('evtId', 5);
      });
    });
  });

  describe('custom log dir via env variable', () => {
    let interceptor;

    beforeEach(() => {
      process.env.APP_LOG_DIR = './target/logs-custom-env';
      shelljs.rm('-rf', process.env.APP_LOG_DIR + '/wix.bi*.log');
      interceptor = testkit.interceptor();
      return interceptor.start();
    });

    afterEach(() => interceptor.stop());

    it('should return logged bi events', () => {
      const logger = biLoggerFactory(process.env.APP_LOG_DIR, {});

      return logger.log({evtId: 10}).then(() => {
        expect(interceptor.events.pop()).to.contain.deep.property('evtId', 10);
      });
    });
  });


  function biLoggerFactory(logDir, aspects) {
    const bi = biClient.factory();
    biSupport.addTo(bi, {
      logDir: logDir,
      filePrefix: 'wix.bi',
      artifactName: 'an-artifact'
    });
    return bi.logger(aspects);
  }
});
