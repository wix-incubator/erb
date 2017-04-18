const crypto = require('wix-crypto');
const expect = require('chai').expect;
const authMiddlewareFactory = require('..'); //index
const fetch = require('node-fetch');
const httpTestkit = require('wix-http-testkit');
const wixExpressErrorHandler = require('wix-express-error-handler');

const WIX_BO_COOKIE_KEY = 'WixBoAuthentication_1_19_0';
const appUrl = 'https://some.address.com/app';
const baseBoUrl = 'https://bo.wix.com/bo-auth';
const boEncryptionKey = '1234567890123456';
const userCookieData = { email: 'aviadh@wix.com', displayName: 'AviadH' };
const userCookieEncrypted = crypto.encrypt(JSON.stringify(userCookieData), { mainKey: boEncryptionKey, cipherEncoding: 'base64' });

const { redirect, authenticate } = authMiddlewareFactory({
  baseBoUrl,
  buildRedirectUrl: () => `${appUrl}/login`,
  boEncryptionKey,
});

describe('bo auth middleware', function () {
  const app = setupApp().beforeAndAfter();

  describe('authenticate', () => {
    it('should return Auth cookie missing error for request without auth cookie', () => {
      return fetch(app.getUrl('/loginrequired'), { headers: { 'Accept': 'application/json'}})
        .then(res => {
          expect(res.status).to.equal(401);
          return res.text();
        })
        .then(text => JSON.parse(text))
        .then(error => {
          expect(error.errorCode).to.equal(-400);
        });
    });

    it('should return status 200 for request sent with auth cookie', () => {
      return fetch(app.getUrl('/loginrequired'), { headers: { 'Cookie': `${WIX_BO_COOKIE_KEY}=${userCookieEncrypted}` } })
        .then(res => expect(res.status).to.equal(200));
    });

    it('should return Internal Server Error for request sent with bad auth cookie', () => {
      return fetch(app.getUrl('/loginrequired'), { headers: { 'Cookie': `${WIX_BO_COOKIE_KEY}=ThisIsSomeRandomString` } })
        .then(res => expect(res.status).to.equal(500));
    });

    it('should put user information on the request for the next middleware', () => {
      return fetch(app.getUrl('/loginrequired'), { headers: { 'Cookie': `${WIX_BO_COOKIE_KEY}=${userCookieEncrypted}` } })
        .then(res => res.json())
        .then(userData => expect(userData).to.eql(userCookieData));
    });
  });

  describe('redirect', () => {
    it('should redirect for a request sent without auth cookie', () => {
      return fetch(app.getUrl('/login'), { redirect: 'manual' })
        .then(res => {
          expect(res.status).to.equal(302);
          expect(res.headers.get('location')).to.include(baseBoUrl);
          expect(res.headers.get('location')).to.include(`${appUrl}/login`);
        })
    });

    it('should return status 200 for a request sent with auth cookie', () => {
      return fetch(app.getUrl('/login'), { headers: { 'Cookie': `${WIX_BO_COOKIE_KEY}=${userCookieEncrypted}` } })
        .then(res => expect(res.status).to.equal(200));
    });

    it('should put user information on the request object for the controller to process', () => {
      return fetch(app.getUrl('/login'), { headers: { 'Cookie': `${WIX_BO_COOKIE_KEY}=${userCookieEncrypted}` } })
        .then(res => res.json())
        .then(userData => expect(userData).to.eql(userCookieData));
    });
  });

  function setupApp() {
    const server = httpTestkit.server();
    const app = server.getApp();
    defineAppRoutes(app);

    return server;
  }

  function defineAppRoutes(app) {
    app.get('/loginrequired', authenticate, (req, res) => {
      res.json(req.wix.boAuth);
    });

    app.get('/login', redirect, (req, res) => {
      res.json(req.wix.boAuth);
    });

    app.use(wixExpressErrorHandler());
  }
});
