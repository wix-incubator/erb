const expect = require('chai').expect,
  testkit = require('./support/testkit'),
  fetch = require('node-fetch'),
  reqOptions = require('wix-req-options');

describe('wnp bootstrap express', function () {

  describe('defaults', () => {
    const app = testkit.app('express').beforeAndAfter();

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

  describe('options', () => {
    const app = testkit.app('options-express').beforeAndAfter();

    it('should pass-over express options from bootstrap to express composer', () =>
      fetch(app.appUrl('/duration/1000'))
        .then(res => expect(res.status).to.equal(504))
    );

  });
});
