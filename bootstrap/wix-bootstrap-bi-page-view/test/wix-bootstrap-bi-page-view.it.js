const expect = require('chai').use(require('chai-subset')).expect,
  testkit = require('wix-bootstrap-testkit'),
  join = require('path').join,
  shell = require('shelljs'),
  _ = require('lodash'),
  http = require('wnp-http-test-client'),
  setCookieParser = require('set-cookie-parser'),
  uuid = require('uuid-support').generate,
  reqOptions = require('wix-req-options');

const COOKIE_NAMES = {
  CLIENT_ID: '_wixCIDX',
  VIEWER_ID: '_wixVIDX',
  USER_ID: '_wixUIDX',
  GLOBAL_SESSION_ID: '_wix_browser_sess'
};

const THREE_MONTHS_IN_SECONDS = 3 * 30 * 24 * 60 * 60;
const COOKIE_DOMAIN = '.wix.com';
const NULL_USER_ID = 'null-user-id';

describe('wix-bootstrap-bi-page-view plugin', function() {
  
  this.timeout(10000);
  
  const env = {APP_LOG_DIR: './target/logs', COOKIE_DOMAIN};
  
  const app = testkit.app('./test/app', {env}).beforeAndAfter();
  
  before(() => clearLogs());
  
  beforeEach(() => touchLogs());
  
  describe('report()', () => {
    
    describe('upon first view', () => {

      it('reports event 1000 with proper fields and GLOBAL section', () => {
        return http.okGet(app.getUrl('/page-view?x=y'), {headers: {'accept-language': 'it-IT', 'referer': 'http://some/url'}})
          .then(() => {
            expect(lastEvent()).to.containSubset({
              'MESSAGE': {
                'evid': 1000,
                'src': 19,
                'browser_language': 'it',
                'referrer': 'http://some/url',
                'http_referrer': app.getUrl('/page-view?x=y')
              },
              'GLOBAL': {
                'url': '/page-view?x=y'
              }
            });
          });
      });
      
      it('updates bi aspect with generated client id', () => {
        return http.okGet(app.getUrl('/page-view'))
          .then(res => {
            expectEvent(1000);
            expect(res.json()).to.have.property('clientId').that.is.not.empty
          });
      });

      it('sets client id cookie', () => {
        return http.okGet(app.getUrl('/page-view'))
          .then(res => {
            expectEvent(1000);
            const clientId = res.json().clientId;
            const cookie = cookieByName('_wixCIDX', res);
            expect(cookie).to.containSubset({
              'value': clientId, 
              'maxAge': THREE_MONTHS_IN_SECONDS,
              'path': '/',
              'domain': COOKIE_DOMAIN});
          });
      });

      it('sets client id cookie if invalid cookie is present in request', () => {
        return http.okGet(app.getUrl('/page-view'), reqOptions.builder().withCookie(COOKIE_NAMES.CLIENT_ID, 'invalid').options())
          .then(res => {
            expectEvent(1000);
            const clientId = res.json().clientId;
            const cookie = cookieByName('_wixCIDX', res);
            expect(cookie).to.containSubset({
              'value': clientId,
              'maxAge': THREE_MONTHS_IN_SECONDS,
              'path': '/',
              'domain': COOKIE_DOMAIN});
          });
      });
      
      it('sets user id cookie to null-user-id', () => {
        return http.okGet(app.getUrl('/page-view'))
          .then(res => {
            expectEvent(1000);
            const cookie = cookieByName(COOKIE_NAMES.USER_ID, res);
            expect(cookie).to.containSubset({
              'value': NULL_USER_ID,
              'maxAge': THREE_MONTHS_IN_SECONDS,
              'path': '/',
              'domain': COOKIE_DOMAIN});
          });
      });
      
      it('generates global session id and sets the cookie', () => {
        return http.okGet(app.getUrl('/page-view'))
          .then(res => {
            expectEvent(1000);
            const globalSessionId = res.json().globalSessionId;
            const cookie = cookieByName(COOKIE_NAMES.GLOBAL_SESSION_ID, res);
            expect(cookie).to.containSubset({
              'value': globalSessionId,
              'maxAge': THREE_MONTHS_IN_SECONDS,
              'path': '/',
              'domain': COOKIE_DOMAIN});
          });
      });

      it('does not set user id cookie if cookie is present in request', () => {
        return http.okGet(app.getUrl('/page-view'), reqOptions.builder().withCookie(COOKIE_NAMES.USER_ID, 'some-user-id').options())
          .then(res => {
            expectEvent(1000);
            expect(cookieByName(COOKIE_NAMES.USER_ID, res)).to.be.undefined
          });
      });
      
      it('reuses viewer id for client id', () => {
        const viewerId = uuid();
        return http.okGet(app.getUrl('/page-view'), reqOptions.builder().withCookie(COOKIE_NAMES.VIEWER_ID, viewerId).options())
          .then(res => {
            expectEvent(1000);
            const cookie = cookieByName(COOKIE_NAMES.CLIENT_ID, res);
            const clientIdFromAspect = res.json().clientId;
            expect(clientIdFromAspect).to.equal(viewerId);
            expect(cookie).to.have.property('value', viewerId);
          });
      });
      
      it('does not reuse invalid viewer id for client id', () => {
        const viewerId = 'invalid';
        return http.okGet(app.getUrl('/page-view'), reqOptions.builder().withCookie(COOKIE_NAMES.VIEWER_ID, viewerId).options())
          .then(res => {
            expectEvent(1000);
            expect(cookieByName('_wixCIDX', res).value).not.to.equal(viewerId);
          });
      });
    });
    
    describe('upon consecutive view', () => {

      it('reports event 1001 with proper fields and GLOBAL section', () => {
        const someClientId = uuid();
        const opts = reqOptions.builder(false)
          .withCookie(COOKIE_NAMES.CLIENT_ID, someClientId)
          .withCookie(COOKIE_NAMES.USER_ID, NULL_USER_ID)
          .withHeader('accept-language', 'it-IT')
          .withHeader('referer',  'http://some/url')
          .options();
        
        return http.okGet(app.getUrl('/page-view?x=y'), opts)
          .then(() => {
            expect(lastEvent()).to.containSubset({
              'MESSAGE': {
                'evid': 1001,
                'src': 19,
                'browser_language': 'it',
                'referrer': 'http://some/url',
                'http_referrer': app.getUrl('/page-view?x=y')
              },
              'GLOBAL': {
                'url': '/page-view?x=y'
              }
            })
          });
      });
    });
    
    it('supports response.render with callback', () => {
      return http.get(app.getUrl('/page-view-with-render'))
        .then(res => {
          expect(res.text()).to.contain('rendered');
          expectEvent(1000);
        });
    });
    
    it('does not report any event if response fails', () => {
      return http.get(app.getUrl('/page-view?fail=true'))
        .then(() => {
          expect(lastEvent()).to.be.undefined;
        });
    });
  });
  
  function expectEvent(eventId) {
    expect(lastEvent()).to.containSubset({'MESSAGE': {'evid': eventId}})
  }
  
  function lastEvent() {
    const events = _.flatMap(logFiles(), file => shell.cat(file).split('\n').filter(line => line !== '')).map(JSON.parse);
    return _.last(events); 
  }
  
  function cookieByName(name, res) {
    return _.flatMap(res.headers.getAll('set-cookie'), setCookieParser.parse).find(c => c.name === name);
  }
  
  function logFiles() {
    return shell.ls(env.APP_LOG_DIR).map(f => join(env.APP_LOG_DIR, f));
  }
  
  function touchLogs() {
    logFiles().forEach(file => shell.echo('').to(file));
  }

  function clearLogs() {
    shell.rm('-rf', env.APP_LOG_DIR);
    shell.mkdir('-p', env.APP_LOG_DIR);
  }
});                    


  
