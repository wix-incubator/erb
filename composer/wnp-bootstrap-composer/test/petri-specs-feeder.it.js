const rpcTestkit = require('wix-rpc-testkit'),
  testkit = require('./support/testkit'),
  expect = require('chai').expect,
  http = require('wnp-http-test-client');
  
describe('management app', function() {
  
  this.timeout(5000);

  const app = testkit.server('petri-specs').beforeAndAfter();
  const fakePetri = rpcTestkit.server({port: 3020}).beforeAndAfter();
  
  it('should send petri spec definitions to petri server upon sync-specs call', () => {
    let pushedExperiments = [];
    fakePetri.when('petriContext', 'addSpecs').respond(params => pushedExperiments = params[0]);
    
    return http.okPost(app.managementAppUrl('/sync-specs'))
      .then(res => {
        expect(res.json()).to.include.members(['spec1', 'spec2']);
        expect(pushedExperiments.map(e => e.key)).to.include.members(['spec1', 'spec2'])
      });
  });
});
