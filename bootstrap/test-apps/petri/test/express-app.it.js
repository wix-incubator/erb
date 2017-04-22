const testkit = require('wix-bootstrap-testkit'),
  petriTestkit = require('wix-petri-testkit'),
  {expect} = require('chai'),
  axios = require('axios');

describe('my service with petri', function () {
  this.timeout(8000);

  const laboratoryFakeServer = petriTestkit.server().beforeAndAfter();
  const kennyServer = testkit.server('./index', {
    env: {
      WIX_BOOT_LABORATORY_URL: `http://localhost:${laboratoryFakeServer.getPort()}`
    }
  }).beforeAndAfter();

  it('should kill kenny due to experiment', () => {
    laboratoryFakeServer.onConductExperiment((key, fallback) => key === 'MySpecForExperiment2' ? 'kill' : fallback);

    return axios(kennyServer.getUrl('/api/to-live-or-not'))
      .then(res => expect(res.data).to.equal('we killed kenny'));
  });

  it('should render conducted experiments to client', () => {
    laboratoryFakeServer.onConductAllInScope(scope => scope === 'my-service-scope' ? {
      'MySpecForExperiment1': 'foobar',
      'MySpecForExperiment2': 'kill-not'
    } : {});
    return axios(kennyServer.getUrl('/index.html'))
      .then(res => expect(res.data).to.have.string('foobar'));
  });
});
