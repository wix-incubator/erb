const expect = require('chai').expect,
  reqOptions = require('wix-req-options'),
  testkit = require('./support/testkit'),
  http = require('wnp-http-test-client'),
  jvmTestkit = require('wix-jvm-bootstrap-testkit');

describe('petri client', function () {
  this.timeout(60000);

  const app = appWithSetup();

  it('should conduct AB test', () =>
    givenABTest('scope', 'anExperiment')
      .then(() => conductExperiment('anExperiment'))
      .then(res => expect(res).to.equal('true'))
  );

  it('should conduct AB test for authenticated user', () => {
    const authenticated = true;
    return givenABTest('scope', 'anExperiment', authenticated)
      .then(() => conductExperiment('anExperiment', authenticated))
      .then(res => expect(res).to.equal('true'))
  });

  it('should conduct all experiments in scope for an authenticated user', () => {
    const authenticated = true;
    return Promise.all([
      givenABTest('scope', 'anExperiment2', authenticated),
      givenABTest('anotherScope', 'anExperiment3')
    ])
      .then(() => conductAllInScope('scope', authenticated))
      .then(res => expect(res).to.deep.equal({'anExperiment2': 'true'}));
  });

  it('should conduct all experiments in scope for anonymous user', () => {
    return Promise.all([
      givenFeatureToggle('scope', 'anExperiment1'),
      givenABTest('scope', 'anExperiment2'),
      givenABTest('anotherScope', 'anExperiment3')
    ])
      .then(() => conductAllInScope('scope'))
      .then(res => expect(res).to.deep.equal({'anExperiment1': 'true', 'anExperiment2': 'true'}));
  });

  it('should conduct all experiments in multiple scopes', () => {
    return Promise.all([
      givenFeatureToggle('scope1', 'anExperiment1'),
      givenABTest('scope2', 'anExperiment2')
    ])
      .then(() => conductAllInScopes('scope1', 'scope2'))
      .then(res => expect(res).to.deep.equal({'anExperiment1': 'true', 'anExperiment2': 'true'}));
  });

  function givenFeatureToggle(scope, key) {
    return http.okPost(`http://localhost:3020/api/laboratory/feature-toggle/${scope}/${key}`)
  }

  function givenABTest(scope, key, authenticated) {
    return http.okPost(`http://localhost:3020/api/laboratory/ab-test${authenticated ? '-authenticated' : ''}/${scope}/${key}`)
  }

  function conductExperiment(key, authenticated) {
    const opts = authenticated ? reqOptions.builder().withBi().withSession().options() : {};
    return http.okGet(app.appUrl(`/conduct/experiment/${key}?fallback=false`), opts)
      .then(res => res.text())
  }

  function conductAllInScope(scope, authenticated) {
    const opts = authenticated ? reqOptions.builder().withBi().withSession().options() : {};
    return http.okGet(app.appUrl(`/conduct/scope/${scope}`), opts)
      .then(res => res.json())
  }

  function conductAllInScopes(...scopes) {
    return http.okGet(app.appUrl(`/conduct/scopes/${scopes.join()}`))
      .then(res => res.json())
  }

  function appWithSetup() {
    const app = testkit.server('petri');
    const laboratoryServer = jvmTestkit.server({
      artifact: {
        groupId: 'com.wixpress.node',
        artifactId: 'wix-spjs-test-server',
        version: '1.0.0-SNAPSHOT'
      },
      port: 3020
    });

    before(() => laboratoryServer.start().then(() => app.start()));
    after(() => laboratoryServer.stop().then(() => app.stop()));
    afterEach(() => http.okPost('http://localhost:3020/api/laboratory/clear'));

    return app;
  }
});
