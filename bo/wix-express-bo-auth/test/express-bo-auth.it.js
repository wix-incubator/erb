const { expect } = require('chai'),
  bootstrapTestkit = require('wix-jvm-bootstrap-testkit'),
  httpTestkit = require('wix-http-testkit'),
  fetch = require('node-fetch'),
  boClient = require('..');

describe('bo auth middleware it', function () {
  this.timeout(60000);
  const server = boServer().beforeAndAfter();
  const app = testApp().beforeAndAfter();

  it('should use same crypto as bo-auth server', () => {
    issueValidCookies()
      .then(cookies => fetch(app.getUrl('/loginrequired'), { headers: { 'Cookie': cookies.join(';') } }))
      .then(res => expect(res.status).to.equal(200))
  });

  function testApp() {
    const srv = httpTestkit.server();
    const app = srv.getApp();
    
    const client = boClient({
      baseBoUrl: 'localhost:3115',
      buildRedirectUrl: req => `${req.get('host')}${req.originalUrl}`, //TODO: set to ours on redirect
      boEncryptionKey: 'initialization12'
    });

    app.get('/loginrequired', client.authenticate, (req, res) => {
      res.end();
    });

    return srv;
  }

  function boServer() {
    return bootstrapTestkit.server({
      artifact: {
        groupId: 'com.wixpress.ci',
        artifactId: 'wix-authentication-server',
        version: '1.0.0-SNAPSHOT'
      },
      config: './test/configs/wix-authentication-server-config.xml'
    });
  }

  function issueValidCookies() {
    return fetch(server.getUrl('/api/v1/authenticate?code=123'))
      .then(res => res.headers.getAll('set-cookie').filter(el => el.startsWith('WixBoAuthentication')));
  }
});
