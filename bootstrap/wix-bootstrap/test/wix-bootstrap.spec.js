'use strict';
const request = require('request'),
  expect = require('chai').expect,
  bootstrap = require('..'),
  join = require('path').join;

const env = {
  PORT: 3000,
  MOUNT_POINT: '/my-app'
};

//TODO: mostly set-up/validation + contracts.
//TODO: config, handlers, rpc, loggng
describe('wix bootstrap', function () {

  describe('setup', () => {

    afterEach(() => {
      process.env.APP_CONF_DIR = undefined;
    });

    it.skip('load config "wix-bootstrap.json" from location defined by env variable APP_CONF_DIR', () => {
      setAppConfDir('');
      request();
      expect();
    });

  });

  function setAppConfDir(path) {
    return join(process.cwd(), process.env());
  }

  //this.timeout(30000);
  //testkit.embeddedApp('test/app/index.js', {env}, testkit.checks.httpGet('/health/is_alive')).beforeAndAfter();
  //
  //it('should load configuration from "process.env.CONF_DIR/wix-bootstrap.json"', () => {
  //
  //});
  //
  //it('should skip loading configuration from file if it is not present', () => {
  //
  //});
  //
  //it('should merge configuration from file and provided options - options take precedence over file', () => {
  //
  //});
  //
  //
  //
  //
  //it('should start an express application', done => {
  //  request('http://localhost:3000/my-app', (error, response) => {
  //    expect(response.statusCode).to.equal(200);
  //    done();
  //  });
  //});
  //
  //it('should provide rpc client', done => {
  //  request('http://localhost:3000/my-app', (error, response) => {
  //    expect(response.statusCode).to.equal(200);
  //    done();
  //  });
  //});
});


