const http = require('wnp-http-test-client'),
  testkit = require('wix-childprocess-testkit'),
  expect = require('chai').expect,
  eventually = require('wix-eventually'),
  httpTestkit = require('wix-http-testkit'),
  statsdTestkit = require('wix-statsd-testkit');

describe('health tests', function () {
  let dependency = healthDependency();
  let app = healthApp(dependency);
  const statsd = statsdTestkit.server().beforeAndAfter();

  beforeEach(() => dependency.start());
  afterEach(() => Promise.all([app.stop(), dependency.stop()]));

  it('should be aware of registered health test', () => {
    return startApp()
      .then(() => http.okGet('http://localhost:3004/health/is_alive_detailed'))
      .then(res => expect(res.text()).to.be.string('service-specific'));
  });

  it('should return 200 and "Alive" for /health/is_alive', () => {
    return startApp()
      .then(() => assertIsAliveIsOk);
  });

  it('should send stats on health test execution', () => {
    return startApp()
      .then(() => assertIsAliveIsOk)
      .then(() => eventually(() => expect(healthTestEventsFor('service-specific').length).to.be.gt(1)));
  });
  
  it('should return 503 for /health/is_alive when health tests fail and display failing test details in is_alive_detailed', () => {
    return startApp()
      .then(toggleHealthTestAsFailing)
      .then(() => eventually(() => {
        return assertIsAliveIsNotOk()
          .then(() => http.get('http://localhost:3004/health/is_alive_detailed'))
          .then(res => {
            expect(res.status).to.equal(503);
            expect(res.json()).to.contain.deep.property('service-specific').that.is.string('failure (Error');
          });
      }));
  });

  it('should recover from health test failure during startup', () => {
    return toggleHealthTestAsFailing()
      .then(startApp)
      .then(() => eventually(assertIsAliveIsNotOk))
      .then(toggleHealthTestAsPassing)
      .then(() => eventually(assertIsAliveIsOk));
  });

  it('should stop health tests on app stop', () => {
    return startApp()
      .then(() => http.post('http://localhost:3004/stop'))
      .then(() => eventually(() => {
        expect(app.output).to.be.string('health manager closed')
      }));
  });

  it('should recover from a failed health test', () => {
    return startApp()
      .then(assertIsAliveIsOk)
      .then(toggleHealthTestAsFailing)
      .then(() => eventually(assertIsAliveIsNotOk))
      .then(toggleHealthTestAsPassing)
      .then(() => eventually(assertIsAliveIsOk));
  });

  function healthTestEventsFor(key) {
    return statsd.events(`class=health-manager.test=${key}`);
  }
  
  function assertIsAliveIsOk() {
    return http.get('http://localhost:3000/health/is_alive')
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.text()).to.equal('Alive');
      });
  }

  function assertIsAliveIsNotOk() {
    return http.get('http://localhost:3000/health/is_alive')
      .then(res => expect(res.status).to.equal(503));
  }

  function toggleHealthTestAsFailing() {
    return Promise.resolve().then(() => dependency.toggleHealthTestAsFailing());
  }

  function toggleHealthTestAsPassing() {
    return Promise.resolve().then(() => dependency.toggleHealthTestAsPassing());
  }

  function healthApp(dependency) {
    return testkit.fork('./test/apps/health', {
      env: {
        PORT: 3000,
        MANAGEMENT_PORT: 3004,
        FORCE_INTERVAL: 100,
        WIX_BOOT_STATSD_INTERVAL: 50,
        HEALTH_TEST_URL: dependency.getUrl()
      }
    }, testkit.checks.httpGet('/'));
  }

  function healthDependency() {
    const server = httpTestkit.server({port: 3015});
    let shouldFail = false;
    server.getApp()
      .get('/health-test', (req, res) => res.sendStatus(shouldFail ? 500 : 200));

    return {
      getUrl: () => server.getUrl('/health-test'),
      toggleHealthTestAsFailing: () => shouldFail = true,
      toggleHealthTestAsPassing: () => shouldFail = false,
      start: () => {
        shouldFail = false;
        return server.start();
      },
      stop: () => server.stop()
    }
  }

  function startApp() {
    return app.start();
  }
});
