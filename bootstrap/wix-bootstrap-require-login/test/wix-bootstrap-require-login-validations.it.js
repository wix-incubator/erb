const expect = require('chai').expect,
  axios = require('axios'),
  testkit = require('wix-bootstrap-testkit'),
  mkWixHeaders = require('wix-http-headers'),
  rpcTestkit = require('wix-rpc-testkit'),
  petriTestkit = require('wix-petri-testkit'),
  {devKey} = require('wix-session-crypto'),
  {devSigningKey} = require('wix-rpc-client-support'),
  emitter = require('wix-config-emitter');

const _16_MINUTES = 16 * 60 * 1000;

describe('wix-bootstrap-require-login validations', () => {
  
  const rpc = rpcTestkit.server().beforeAndAfter();

  before(() => emitter({ sourceFolders: ['./templates'], targetFolder: './target/configs' })
    .fn('base_domain', 'localhost')
    .fn('rpc_service_url', 'com.wixpress.wix-html-login-webapp', rpc.getUrl())
    .emit());

  const petri = petriTestkit.server().beforeAndAfter();

  const env = {
    WIX_BOOT_PUBLIC_STATICS_URL: 'http://static.parastorage.com/',
    WIX_BOOT_SEEN_BY: 'seen-by-env',
    WIX_BOOT_LABORATORY_URL: `http://localhost:${petri.getPort()}`,
    WIX_BOOT_PETRI_URL: `http://localhost:${rpc.getPort()}`,
    WIX_BOOT_STATSD_HOST: 'localhost',
    WIX_BOOT_RPC_SIGNING_KEY: devSigningKey,
    WIX_BOOT_SESSION2_KEY: devKey,
    NODE_ENV: 'production'
  };

  const app = testkit.server('./test/app/test-app-launcher', {env}).beforeAndAfter();

  const http = axios.create({validateStatus: null, url: app.getUrl('/required-login-with-forbid-resource')});
  
  beforeEach(() => {
    petri.reset();
    rpc.reset();
  });
  
  describe('OFAC countries restriction', () => {

    it('rejects request to protected resource', () => {
      const headers = mkWixHeaders()
        .withSession()
        .withHeader('x-wix-country-code', 'KP')
        .withHeader('accept', 'application/json')
        .headers();

      return http.request({headers})
        .then(res => {
          expect(res.status).to.equal(400); /* obscurity */
          expect(res.data).to.have.property('errorCode', -16);
        });
    });

    it('passes if no country provided', () => {
      const headers = mkWixHeaders()
        .withSession()
        .withHeader('accept', 'application/json')
        .headers();

      return http.request({headers})
        .then(res => expect(res.status).to.equal(200));
    });
  });
  
  describe('remote session validation and renewal', () => {
    
    it('rejects request upon remote session validation failure', () => {
      const wixHeaders = mkWixHeaders().withSession(requiresValidation());
      const headers = wixHeaders.headers();

      validationEnabled();
      remoteFailsForUser(wixHeaders.session().session.userGuid);

      return http.request({headers})
        .then(res => expect(res.status).to.equal(401));
    });
    
    it('passes request if validation disabled', () => {
      const wixHeaders = mkWixHeaders().withSession(requiresValidation());
      const headers = wixHeaders.headers();

      validationDisabled();
      remoteFailsForUser(wixHeaders.session().session.userGuid);

      return http.request({headers})
        .then(res => expect(res.status).to.equal(200));
    });
    
    it('registers experiment petri toggler spec', () => {
      let receivedSpecs;
      rpc.when('petriContext', 'addSpecs').respond(params => receivedSpecs = params[0]);

      return axios.post(app.getManagementUrl('/sync-specs'))
        .then(() => expect(receivedSpecs).to.have.deep.property('[0].key', 'wnp.security.ValidateSession'));
    });
  });
  
  function requiresValidation() {
    return {lvld: new Date(Date.now() - _16_MINUTES)};
  }
  
  function remoteFailsForUser(userGuid) {
    rpc.when('RemoteRenewalSessionValidationService', 'validate').respond(([{session}]) => {
      if (session.userGuid === userGuid) {
        return {valid: false, cookies: []};
      } else {
        throw new Error('unexpected userGuid');
      }
    });
  }
  
  function stubPetri(enabled) {
    petri.onConductExperiment((key, fallback) => {
      return key === 'wnp.security.ValidateSession' && fallback === 'false' ? enabled : fallback;
    });
  }
  
  function validationEnabled() {
    stubPetri('true');
  }

  function validationDisabled() {
    stubPetri('false');
  }
});
