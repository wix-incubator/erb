'use strict';
const rp = require('request-promise'),
  testkit = require('wix-childprocess-testkit'),
  httpTestkit = require('wix-http-testkit'),
  bodyParser = require('body-parser');

module.exports.delay = ms => new Promise(resolve => setTimeout(() => resolve(), ms || 1000));

module.exports.server = (app, env, check) => new Testkit(app, env, check);

function Testkit(app, env, check) {
  const port = 3000;
  const environment = Object.assign({}, process.env, {PORT: port}, env || {});
  const server = testkit.fork(`./test/apps/${app}`, {env: environment, timeout: 20000}, check || testkit.checks.httpGet('/'));
  const httpApp = new HttpProbe();

  this.beforeAndAfter = () => {
    httpApp.beforeAndAfter();
    server.beforeAndAfter();
    return this;
  };

  this.beforeAndAfterEach = () => {
    httpApp.beforeAndAfterEach();
    server.beforeAndAfterEach();
    return this;
  };

  this.getStats = () => rp(`http://localhost:${port}/stats`).then(res => JSON.parse(res));

  this.port = port;

  this.events = httpApp.events;

  this.get = path => rp({uri: `http://localhost:${this.port}${path}`, resolveWithFullResponse: true});

  this.output = () => server.output;
}

function HttpProbe() {
  let events = [];
  const server = httpTestkit.server({port: 3004});
  server.getApp()
    .use(bodyParser.json())
    .post('/', (req, res) => {
      events.push(req.body);
      res.end();
    });

  this.beforeAndAfter = () => {
    before(() => events.length = 0);
    server.beforeAndAfter();
    return this;
  };

  this.beforeAndAfterEach = () => {
    beforeEach(() => events.length = 0);
    server.beforeAndAfterEach();
    return this;
  };


  this.events = events;
}