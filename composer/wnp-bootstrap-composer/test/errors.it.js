const testkit = require('./support/testkit'),
  expect = require('chai').use(require('chai-as-promised')).expect,
  fetch = require('node-fetch'),
  retryAsPromised = require('retry-as-promised');

describe('error handling', function () {
  this.timeout(10000);

  describe('error handlers', () => {
    const app = testkit.server('error-handlers').beforeAndAfterEach();

    it('log unhandled rejections and keep app running', () =>
      aGet(app.appUrl('/unhandled-rejection'))
        .then(() => retry(() => {
          expect(app.stdouterr()).to.be.string('Unhandled Rejection at: Promise');
          expect(app.stdouterr()).to.be.string('at process._tickDomainCallback');
        }))
        .then(() => aGet(app.appUrl('/ok')))
    );

    it('log uncaught exceptions and allow process to die', () =>
      aGet(app.appUrl('/uncaught-exception'))
        .then(() => retry(() => {
          expect(app.stdouterr()).to.be.string('Error: uncaught');
          expect(app.stdouterr()).to.be.string('at process._tickDomainCallback');
        }))
        .then(() => expect(aGet(app.appUrl('/ok'))).to.eventually.be.rejected)
    );
  });

  function aGet(url) {
    return fetch(url)
      .then(res => {
        expect(res.status).to.equal(200);
        return res.text().then(text => {
          return {res, text};
        });
      })
  }

  function retry(cb) {
    return retryAsPromised(() => Promise.resolve().then(() => cb()), 5)
  }
});
