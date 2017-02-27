const expect = require('chai').expect,
  testkit = require('wix-http-testkit'),
  http = require('wnp-http-test-client'),
  sinon = require('sinon'),
  configure = require('../lib/specs-express-app');

require('sinon-as-promised');

describe('specs-express-app', () => {
  
  const server = testkit.server().beforeAndAfter();
  const callback = sinon.stub();
  server.getApp().use(configure(callback));
  
  it('should configure express app that responds to /sync-specs POST and triggers provided callback', () => {
    callback.resolves(['s1', 's2']);
    return http.okPost(server.getUrl('/sync-specs'))
      .then(res => expect(res.json()).to.deep.equal(['s1', 's2']));
  });
  
  it('should handle failure', () => {
    callback.rejects(new Error('woof'));
    return http.post(server.getUrl('/sync-specs'))
      .then(res => {
        expect(res.status).to.be.equal(500);
        expect(res.text()).to.match(/woof/);
      });
  });
});
