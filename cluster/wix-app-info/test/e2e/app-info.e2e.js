const expect = require('chai').expect,
  testkit = require('wix-childprocess-testkit'),
  get = require('../test-utils'),
  path = require('path'),
  shelljs = require('shelljs');

describe('App info e2e', function () {
  this.timeout(10000);
  const app = './test/apps/run-node';
  const appPort = 3000;
  const heapDumpDir = './target/heap-dump-e2e';

  testkit.fork(app, { env: { PORT: appPort, HEAP_DUMP_DIR: heapDumpDir } }, testkit.checks.httpGet('/'))
    .beforeAndAfter();

  const tmp = path.resolve(heapDumpDir);

  beforeEach(() => {
    if (shelljs.test('-e', tmp)) {
      shelljs.rm('-rf', tmp);
    }
  });

  it('should show generate heap dump button', () => {
    browser.get(`http://localhost:${appPort}/heap-dump`)
      .then(() => element(by.id('make-heap-dump')).getText())
      .then(buttonText => expect(buttonText).to.be.equal('Generate heap dumps'));
  });

  it('should generate heap dump on button click and display dump location path', () => {
    browser.get(`http://localhost:${appPort}/heap-dump`)
      .then(() => element(by.id('make-heap-dump')).click())
      .then(() => browser.wait(ExpectedConditions.presenceOf(element(by.css('.path'))), 3000))
      .then(() => getHeapDumpJson())
      .then(dump => {
        return element.all(by.css('.path')).first().getText()
          .then(path => expect(path).to.be.deep.equal(dump.path))
      });
  });

  function getHeapDumpJson() {
    return get.jsonSuccess(`http://localhost:${appPort}/heap-dump/api`)
      .then(json => json.dumps.find(dump => dump.status === 'READY'))
  }
});
