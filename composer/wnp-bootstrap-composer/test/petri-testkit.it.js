const expect = require('chai').expect,
  petriTestkit = require('wix-petri-testkit'),
  testkit = require('./support/testkit'),
  http = require('wnp-http-test-client');

describe('petri testkit', function() {
  const petri = petriTestkit.server().beforeAndAfter();
  const app = testkit.server('petri').beforeAndAfter();  
  
  /*
   * @see https://github.com/wix-private/wix-petri/blob/master/wix-petri-integration/src/main/java/com/wixpress/framework/featuretoggle/overrides/ExperimentsOverrideQueryStringCodec.java
   */
  it('supports petri overrides via query string params in conductExperiment API', () => {
    petri.onConductExperiment(() => 'stubbed-value');
    const url = app.appUrl('/conduct/experiment/experiment1') + '?petri_ovr=experiment1:overridden-value&fallback=fallback-value' 
    return http.okGet(url)
      .then(res => expect(res.text()).to.equal('overridden-value'));
  });

  it('supports petri overrides via query string params in conductAllInScope API', () => {
    petri.onConductAllInScope(() => ({'experiment1': 'stubbed-value1', 'experiment2': 'stubbed-value2'}));
    
    return http.okGet(app.appUrl('/conduct/scope/some-scope') + '?petri_ovr=experiment1:overridden-value')
      .then(res => expect(res.json()).to.deep.equal({'experiment1':'overridden-value', 'experiment2':'stubbed-value2'}));
  });
});
