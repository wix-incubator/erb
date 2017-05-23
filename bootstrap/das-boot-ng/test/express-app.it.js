const {app, biEvents, gatekeeperServer, rpcServer, laboratoryServer} = require('./environment'),
  expect = require('chai').expect,
  axios = require('axios'),
  specs = require('../lib/petri-specs'),
  wixHeaders = require('wix-http-headers'),
  eventually = require('wix-eventually');

describe('app', function () {

  describe('/req', () => {
    it('should return request data', () => {
      return axios(app.getUrl('/api/req')).then(res => {
        expect(res.status).to.equal(200);
        expect(res.data).to.contain.deep.property('protocol', 'http');
      });
    });
  });

  describe('/aspects', () => {
    it('should return aspect store', () => {
      const reqOptions = wixHeaders().withSession();
      const session = reqOptions.session();
      const headers = reqOptions.headers();

      return axios(app.getUrl('/api/aspects'), {headers}).then(res => {
        expect(res.status).to.equal(200);
        expect(res.data).to.contain.deep.property('session.userGuid', session.session.userGuid);
      });
    });
  });


  describe('/hello', () => {
    it('should respond with hi', () => {
      return axios(app.getUrl('/api/hello')).then(res => {
        expect(res.status).to.equal(200);
        expect(res.data).to.equal('hi')
      });
    });
  });

  describe('/rpc', () => {
    it('should return metasite details by metasiteId', () => {
      return axios(app.getUrl('/api/rpc/site/5ae0b98c-8c82-400c-b76c-a191b71efca5')).then(res => {
        expect(res.status).to.equal(200);
        expect(res.data).to.contain.deep.property('id', '5ae0b98c-8c82-400c-b76c-a191b71efca5');
        expect(res.data).to.contain.deep.property('name', 'das-site');
      });
    });
  });

  describe('/bi', () => {
    it('should log bi messages to files', () => {
      return axios(app.getUrl('/api/bi/event')).then(res => {
        const event = biEvents().pop();

        expect(res.status).to.equal(200);
        expect(event).to.contain.property('evid', 300);
        expect(event).to.contain.property('src', 11);
      });
    });
  });

  describe('/petri', () => {
    it('should conduct experiment', () => {
      return axios(app.getUrl('/api/petri/aSpec/false')).then(res => {
        expect(res.status).to.equal(200);
        expect(res.data).to.equal(true);
      });
    });
    
    it('should export petri specs to petri server', () => {
      let receivedSpecs;
      rpcServer.when('petriContext', 'addSpecs').respond(params => receivedSpecs = params[0]);
      
      return axios.post(app.getManagementUrl('/sync-specs'))
        .then(res => {
          expect(res.status).to.equal(200);
          expect(receivedSpecs).to.have.deep.property('[0].key', specs.keys.spec1);
          expect(receivedSpecs).to.have.deep.property('[1].key', specs.keys.spec2);
        });
    });
    
    it('should conduct experiment using spec definition', () => {
      const spec = specs.all[specs.keys.spec2];
      laboratoryServer.onConductExperiment(() => spec.testGroups[1]);
      return axios(app.getUrl('/api/petri/conduct-via-spec')).then(res => {
        expect(res.data).to.equal(spec.testGroups[1]);
      });
    });
    
    it('should conduct experiment using spec definition with authorization context', () => {
      const reqOptions = wixHeaders().withSession();
      const userGuid = reqOptions.session().session.userGuid;
      const headers = reqOptions.headers();
      const spec = specs.all[specs.keys.spec2];
      const metaSiteId = 'msid123';
      laboratoryServer.onConductExperiment(() => spec.testGroups[1]);
      gatekeeperServer.givenUserPermission(userGuid, metaSiteId, {scope: 'scope', action: 'action'});

      return axios(app.getUrl(`/api/petri-with-gatekeeper/conduct-via-spec/${metaSiteId}`), {headers})
        .then(res => {
          expect(res.status).to.equal(200);
          expect(res.data).to.equal(spec.testGroups[1]);
        });
    });
  });

  describe('/gatekeeper', () => {
    it('should authorize user using gatekeeper', () => {
      const reqOptions = wixHeaders().withSession();
      const userGuid = reqOptions.session().session.userGuid;
      const headers = reqOptions.headers();

      gatekeeperServer.givenUserPermission(userGuid, 'metasiteId', {scope: 'scope', action: 'action'});

      return axios(app.getUrl('/api/gatekeeper/metasiteId/scope/action'), {headers}).then(res => {
        expect(res.status).to.equal(201);
      });
    });
  });

  describe('/errors', () => {

    it('should handle sync thrown error', () => {
      return axios(app.getUrl('/api/errors/error-sync'), {validateStatus: () => true}).then(res => {
        expect(res.status).to.equal(500);
        expect(res.data).to.contain.property('errorCode', 10000);
      });
    });

    it('should handle sync nexted error', () => {
      return axios(app.getUrl('/api/errors/error-next'), {validateStatus: () => true}).then(res => {
        expect(res.status).to.equal(500);
        expect(res.data).to.contain.property('errorCode', 10001);
      });
    });

    it('should handle async uncaught error', () => {
      let deathCountBefore = 0;
      return getAppInfoData()
        .then(deathCount => deathCountBefore = deathCount)
        .then(() => axios(app.getUrl('/api/errors/error-async'), {validateStatus: () => true}))
        .then(res => {
          expect(res.status).to.equal(500);
          expect(res.data).to.contain.property('errorCode', 10002);
        })
        .then(() => eventually(() => {
          return getAppInfoData().then(deathCount =>
            expect(deathCountBefore).to.be.lt(deathCount));
        }));
    });

    function getAppInfoData() {
      return axios(app.getManagementUrl('/app-info/about/api'))
        .then(res => res.data.workerDeathCount);
    }

  });

  describe('/health', () => {

    afterEach(() => {
      return axios.post(app.getUrl('/api/health/alive'))
        .then(() => eventually(() => axios.get(app.getUrl('/health/is_alive'))));
    });

    it('toggles between healthy/unhealthy states', () => {
      return axios.post(app.getUrl('/api/health/dead'))
        .then(() => eventually(() => {
          return axios.get(app.getUrl('/health/is_alive'), {validateStatus: () => true})
            .then(res => expect(res.status).to.equal(503))
        }))
        .then(() => axios.post(app.getUrl('/api/health/alive')))
        .then(() => eventually(() => {
          return axios.get(app.getUrl('/health/is_alive'), {validateStatus: () => true})
            .then(res => expect(res.status).to.equal(200))
        }));
    });

  });

});
