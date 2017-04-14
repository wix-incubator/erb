const expect = require('chai').expect,
  testkit = require('wix-childprocess-testkit'),
  get = require('../test-utils'),
  path = require('path'),
  shelljs = require('shelljs');

describe('App info e2e', function () {
  this.timeout(10000);
  const app = './test/apps/run-node';
  const appPort = 3000;
  const profilingResourcesDir = './target/e2e-tmp';

  testkit.fork(app, { env: { PORT: appPort, PROFILING_RESOURCES_DIR: profilingResourcesDir } }, testkit.checks.httpGet('/'))
    .beforeAndAfter();

  const tmp = path.resolve(profilingResourcesDir);

  beforeEach(() => {
    if (shelljs.test('-e', tmp)) {
      shelljs.rm('-rf', tmp);
      shelljs.mkdir('-p', tmp + '/profiles');
      shelljs.mkdir('-p', tmp + '/heapdump');
    }
  });

  it('should show generate heap dump button', () => {
    browser.get(`http://localhost:${appPort}/heap-dump`)
      .then(() => element(by.id('make-heap-dump')).getText())
      .then(buttonText => expect(buttonText).to.be.equal('Generate heap dump'));
  });

  it('should generate heap dump on button click and display dump location path', () => {
    browser.get(`http://localhost:${appPort}/heap-dump`)
      .then(() => element(by.id('make-heap-dump')).click())
      .then(() => browser.wait(ExpectedConditions.presenceOf(element(by.css('.path'))), 3000))
      .then(() => browser.wait(ExpectedConditions.textToBePresentInElement(element(by.css('.status')), 'READY'), 3000));
  });

  it('should show cpu profiling buttons', () => {
    browser.get(`http://localhost:${appPort}/cpu-profile`)
      .then(() => element(by.id('make-cpu-profile')).getText())
      .then(buttonText => expect(buttonText).to.be.equal('Generate CPU profile'));
  });

  it('should generate heap dump on button click and display dump location path', () => {
    browser.get(`http://localhost:${appPort}/cpu-profile`)
      .then(() => element(by.cssContainingText('option', '1 second')).click())
      .then(() => element(by.id('make-cpu-profile')).click())
      .then(() => browser.wait(ExpectedConditions.textToBePresentInElement(element(by.css('.status')), 'READY'), 3000));
  });

  function after(duration) {
    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }
});
