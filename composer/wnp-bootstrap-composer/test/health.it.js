const http = require('wnp-http-test-client'),
  testkit = require('wix-childprocess-testkit'),
  expect = require('chai').expect,
  eventually = require('wix-eventually');

describe('a service', function () {
  this.timeout(10000);
  let app = healthApp().beforeAndAfterEach();

  it('should be aware of registered health test', () => {
    return http.okGet('http://localhost:3004/health/is_alive_detailed')
      .then(res => expect(res.text()).to.be.string('service-specific'));
  });

  it('should return 503 for /health/is_alive when health tests fail and failing test details', () => {
    return givenHeathTestFails()
      .then(() => eventually(() => {
        return http.get('http://localhost:3000/health/is_alive')
          .then(res => expect(res.status).to.equal(503))
          .then(() => http.get('http://localhost:3004/health/is_alive_detailed'))
          .then(res => {
            expect(res.status).to.equal(503);
            expect(res.json()).to.contain.deep.property('service-specific').that.is.string('failure (Error');
          });
      }));
  });

  it('should stop health tests on app stop', () => {
    return http.post('http://localhost:3004/stop')
      .then(() => eventually(() => {
        expect(app.output).to.be.string('health manager closed')
      }));
  });

  it('should recover from a failed health test', () => {
    return assertIsAliveIsOk()
      .then(toggleHealthTestAsFailing)
      .then(() => eventually(assertIsAliveIsNotOk))
      .then(toggleHealthTestAsPassing)
      .then(() => eventually(assertIsAliveIsOk));
  });
  
  function assertIsAliveIsOk() {
    return http.get('http://localhost:3000/health/is_alive')
      .then(res => expect(res.status).to.equal(200))
  }

  function assertIsAliveIsNotOk() {
    return http.get('http://localhost:3000/health/is_alive')
      .then(res => expect(res.status).to.equal(503))
  }
  
  
  function givenHeathTestFails() {
    return http.post('http://localhost:3000/health-check-fail', {method: 'POST'});
  }

  function toggleHealthTestAsFailing() {
    return http.post('http://localhost:3000/health-check-fail', {method: 'POST'});
  }

  function toggleHealthTestAsPassing() {
    return http.post('http://localhost:3000/health-check-pass', {method: 'POST'});
  }
  
  function healthApp() {
    return testkit.fork('./test/apps/health', {
      env: {
        PORT: 3000,
        MANAGEMENT_PORT: 3004,
        FORCE_INTERVAL: 100
      }
    }, testkit.checks.httpGet('/'));
  }
});
