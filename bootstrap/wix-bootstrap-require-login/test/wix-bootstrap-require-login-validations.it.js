const expect = require('chai').expect,
  axios = require('axios'),
  testkit = require('wix-bootstrap-testkit'),
  reqOptions = require('wix-req-options');

describe('wix-bootstrap-require-login validations', () => {

  const app = testkit.server('./test/app/test-app-launcher').beforeAndAfter();
  
  describe('OFAC countries restriction', () => {

    it('rejects request to protected resource', () => {
      const opts = reqOptions.builder(false)
        .withSession()
        .withHeader('x-wix-country-code', 'KP')
        .withHeader('accept', 'application/json')
        .options();

      return axios(app.getUrl('/required-login-with-forbid-resource'), Object.assign(opts, {validateStatus: null}))
        .then(res => {
          expect(res.status).to.equal(400); /* obscurity */
          expect(res.data).to.have.property('errorCode', -16);
        });
    });
    
    it('passes if no country provided', () => {
      const opts = reqOptions.builder(false)
        .withSession()
        .withHeader('accept', 'application/json')
        .options();

      return axios(app.getUrl('/required-login-with-forbid-resource'), opts)
        .then(res => expect(res.status).to.equal(200));
    });
  });
});
