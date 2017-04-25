const {expect} = require('chai'),
  wixExpressCsrf = require('../index'),
  axios = require('axios'),
  testkit = require('wix-http-testkit'),
  Tokens = require('csrf'),
  cookieParser = require('cookie-parser');

describe('wix-express-csrf', () => {
  const server = aServer().beforeAndAfter();
  axios.defaults.baseURL = server.getUrl();

  describe('requests sent with xsrf headers', () => {
    
    before(() => {
      const secret = (new Tokens()).secretSync();
      axios.defaults.headers.common['x-xsrf-token'] = secret;
      axios.defaults.headers.common.Cookie = `XSRF-TOKEN=${secret}`;
    });

    after(() => {
      delete axios.defaults.headers.common['x-xsrf-token'];
      delete axios.defaults.headers.common.Cookie;
    });

    ['delete', 'put', 'get', 'post'].forEach(method => {
      it(`should be valid with ${method}`, () => {
        return axios[method](`/${method}`).then(response => {
          expect(response.status).to.equal(200);
        })
      });
    })
  });

  describe('requests sent without xsrf headers', () => {

    it('should be valid with GET', () => (
      axios.get('/get').then(response => {
        expect(response.status).to.equal(200);
      })
    ));

    ['post', 'put', 'delete'].forEach(method => {
      it(`should throw 403 with ${method}`, () => (
        axios[method](`/${method}`).catch(err => {
          expect(err.response.status).to.equal(403);
        })
      ));
    });
  });

  function aServer() {
    const server = testkit.server();
    const app = server.getApp();

    app.use(cookieParser(), wixExpressCsrf());

    ['get', 'post', 'put', 'delete'].forEach(method => {
      app[method](`/${method}`, (req, res) => res.sendStatus(200));
    });

    return server;
  }
});
