'use strict';
const expect = require('chai').expect,
  rp = require('request-promise'),
  _ = require('lodash'),
  env = require('env-support').basic({SOME_KEY: 'SOME_VALUE'}),
  testkit = require('wix-childprocess-testkit'),
  packageJson = require('../package.json');

describe('app-info', function () {
  this.timeout(30000);

  describe('defaults', () => {
    const testApp = testkit.embeddedApp('./test/apps/defaults.js', {env}, testkit.checks.httpGet('/'));
    testApp.beforeAndAfter();

    it('should serve "/about" on "/', () => {
      return rp(appUrl('/')).then(html => {
        expect(html).to.contain(packageJson.name);
        expect(html).to.contain(packageJson.version);
      });
    });

    it('should serve "/about" with basic app info', () => {
      return rp(appUrl('/about')).then(html => {
        expect(html).to.contain(packageJson.name);
        expect(html).to.contain(packageJson.version);
      });
    });

    it('should serve "/env" with listed environment variables', () => {
      return rp(appUrl('/env')).then(res => {
        expect(res).to.contain('SOME_KEY');
        expect(res).to.contain('SOME_VALUE');
      });
    });

    it.skip('should serve "/configs" with info from configs', () => {});
  });

  describe('custom view', () => {
    const testApp = testkit.embeddedApp('./test/apps/custom-view.js', {env}, testkit.checks.httpGet('/'));
    testApp.beforeAndAfter();

    it('should server custom view', () => {
      return rp(appUrl('/custom')).then(res => {
        expect(res).to.contain('anItemName');
        expect(res).to.contain('anItemValue');
      });
    });
  });

  describe('without package.json and pom.xml', () => {
    const testApp = testkit.embeddedApp('./test/apps/no-packagejson-and-no-maven.js', {env}, testkit.checks.httpGet('/'));
    testApp.beforeAndAfter();

    it('should load "/about"', () => {
      return rp(appUrl('/about')).then(html => {
        expect(html).to.not.contain(`<td>${packageJson.version}</td>`);
      });
    });

    it('should load "/env"', () => {
      return rp(appUrl('/env'));
    });
  });

  function appUrl(path) {
    return `http://localhost:${env.PORT}${env.MOUNT_POINT}${path || '/'}`;
  }
});