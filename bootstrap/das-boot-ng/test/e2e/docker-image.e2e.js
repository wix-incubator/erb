const co = require('co');
const eventually = require('wix-eventually');
const axios = require('axios');
const expect = require('chai').expect;
const wixHeaders = require('wix-http-headers');
const {app, statsdServer, rpcServer, gatekeeperServer} = require('./dockerized-environment');

describe('app inside container', function () {
  this.timeout(60 * 1000);
  describe('/rpc', function () {
    it('should return metasite details by metasiteId', co.wrap(function *() {
      yield rpcServer.when('ReadOnlyMetaSiteManager', 'getMetaSite', {
        id: '5ae0b98c-8c82-400c-b76c-a191b71efca5',
        name: 'das-site'
      });

      const res = yield axios.get(app.getUrl('/api/rpc/site/5ae0b98c-8c82-400c-b76c-a191b71efca5'));

      expect(res.status).to.equal(200);
      expect(res.data).to.contain.deep.property('id', '5ae0b98c-8c82-400c-b76c-a191b71efca5');
      expect(res.data).to.contain.deep.property('name', 'das-site');
    }));
  });

  describe('statsd', function () {

    function assertOnEvents(eventFragment, assertion) {
      const getEventsAndAssert = () =>
        statsdServer.events(eventFragment)
          .then(assertion);
      return eventually(getEventsAndAssert, {timeout: 5000});
    }

    it('should log request metrics', co.wrap(function *() {
      const res = yield axios.get(app.getUrl('/api/hello'));

      expect(res.status).to.equal(200);

      yield assertOnEvents('resource=get_api_hello.samples', events => {
        expect(events).to.not.be.empty;
        expect(events[0].value).to.equal(1);
      });
    }));

    it('should log handled sync nexted error', co.wrap(function *() {
      const res = yield axios(app.getUrl('/api/errors/error-next'), {validateStatus: () => true});

      expect(res.status).to.equal(500);
      expect(res.data).to.contain.property('errorCode', 10001);

      yield assertOnEvents('error=NextError.code=10001.samples', events => {
        expect(events).to.not.be.empty;
        expect(events[0].value).to.equal(1);
      });
    }));
  });

  describe('/gatekeeper', () => {

    it('should authorize user using gatekeeper', co.wrap(function*() {
      const reqOptions = wixHeaders().withSession();
      const userGuid = reqOptions.session().session.userGuid;
      const headers = reqOptions.headers();

      yield gatekeeperServer.givenUserPermission(userGuid, 'metasiteId', {scope: 'scope', action: 'action'});

      const res = yield axios.get(app.getUrl('/api/gatekeeper/metasiteId/scope/action'), {headers});

      expect(res.status).to.equal(201);
    }));
  });
});
