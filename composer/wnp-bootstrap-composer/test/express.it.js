const expect = require('chai').expect,
  testkit = require('./support/testkit'),
  fetch = require('node-fetch'),
  reqOptions = require('wix-req-options');

describe('express', function () {
  this.timeout(10000);

  describe('defaults', () => {
    const app = testkit.server('express').beforeAndAfter();

    it('should start app that responds to "/health/is_alive" on app port as per ops contract', () =>
      aGet(app.appUrl('/health/is_alive'))
    );
    
    it('should disable x-powered-by header by default', () =>
      aGet(app.appUrl('/health/is_alive'))
        .then(res => expect(res.res.headers.get('x-powered-by')).to.equal(null))
    );
    
    it('should provide access to aspects within express app', () => {
      const opts = reqOptions.builder().options();
      return fetch(app.appUrl('/req-context'), opts).then(res => {
        expect(res.status).to.equal(200);
        return res.json();
      }).then(json => expect(json).to.have.deep.property('requestId', opts.headers['x-wix-request-id']));
    });

    it('should provide access to decoded session within express app', () => {
      const req = reqOptions.builder().withSession();
      return fetch(app.appUrl('/wix-session'), req.options()).then(res => {
        expect(res.status).to.equal(200);
        return res.json();
      }).then(json => expect(json).to.deep.equal(req.wixSession.sessionJson));
    });

    it('should set cache-control headers to no-cache by default', () => {
      return fetch(app.appUrl('/cache-control')).then(res => {
        expect(res.status).to.equal(200);
        expect(res.headers.get('cache-control')).to.equal('no-cache');
      });
    });

    it('should provide access to newrelic within express app', () => {
      return fetch(app.appUrl('/newrelic')).then(res => {
        expect(res.status).to.equal(200);
        return res.json();
      }).then(json => expect(json).to.deep.equal({
        reqTimingHeaders: '',
        appTimingHeaders: ''
      }));
    });
  });

  describe('express 1/2-arg function support', () => {
    const app = testkit.server('express-app-composer').beforeAndAfter();

    it('should support express function with 1 arg (context)', () => {
      return aGet(app.appUrl('/composer-1-arg'))
        .then(res => expect(res.text).to.equal('wnp-bootstrap-composer'))
    });

    it('should support express function with 2 args (app, context) where app is injected by composer', () => {
      return aGet(app.appUrl('/composer-2-args'))
        .then(res => expect(res.text).to.equal('wnp-bootstrap-composer'))
    });
  });
  
  describe('custom express app', () => {
    const app = testkit.server('express').beforeAndAfter();

    it('should allow to add express app and mount it onto main app port and mount point', () =>
      aGet(app.appUrl('/custom')).then(res => expect(res.text).to.equal('custom'))
    );
  });
  
  describe('options', () => {
    const app = testkit.server('express-options').beforeAndAfter();

    it('should pass-over express options from bootstrap to express composer', () =>
      fetch(app.appUrl('/duration/1000'))
        .then(res => expect(res.status).to.equal(504))
    );
  });

  function aGet(url) {
    return fetch(url)
      .then(res => {
        expect(res.status).to.equal(200);
        return res.text().then(text => {
          return {res, text};
        });
      })
  }
  
});
