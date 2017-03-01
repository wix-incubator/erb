const expect = require('chai').use(require('sinon-chai')).use(require('chai-as-promised')).expect,
  sinon = require('sinon'),
  runTests = require('../../lib/health/run-tests'),
  run = runTests.run,
  wrapper = runTests.wrapper,
  Success = runTests.Success,
  Failure = runTests.Failure,
  Promise = require('bluebird'),
  WixMeasuredMetering = require('wix-measured-metering'),
  {ErrorCode} = require('wix-errors'),
  Logger = require('wnp-debug').Logger;

require('sinon-as-promised');

describe('run-tests', () => {

  describe('runHealthTest', () => {

    it('wraps a health test with WixMeasuredMetering.promise once regardless number of test executions', () => {
      const {wrapHealthTest, metering} = runHealthTestMocks();

      const wrapped = wrapHealthTest('one', () => Promise.resolve());

      return Promise.all([wrapped(), wrapped()]).then(() => {
        expect(metering.promise).to.have.been.calledOnce;
      });
    });

    it('should resolve with Success outcome', () => {
      const {runHealthTest} = runHealthTestMocks();

      return runHealthTest('one', () => Promise.resolve()).then(res => {
        expect(res).to.be.instanceOf(runTests.Success);
      });
    });

    it('should resolve with Failure outcome', () => {
      const {runHealthTest} = runHealthTestMocks();

      return runHealthTest('one', () => Promise.reject(new Error('woop'))).then(res => {
        expect(res).to.be.instanceOf(runTests.Failure);
      });
    });

    it('should be a failure if test took longer that provided timeout', () => {
      const {runHealthTest} = runHealthTestMocks({timeout: 500});

      return runHealthTest('one', () => Promise.delay(1000)).then(res => {
        expect(res).to.be.instanceOf(Failure);
        expect(res.toString()).to.be.string('TimeoutError');
      });
    });

    it('should log failure', () => {
      const {log, runHealthTest} = runHealthTestMocks();
      const error = new Error('wow');

      return runHealthTest('one', () => Promise.reject(error)).then(() => {
        expect(log.error).to.have.been.calledWithMatch(sinon.match('HealthTest failure: one - '), error).calledOnce;
      });
    });

    it('should convert functions to promises', () => {
      const {runHealthTest} = runHealthTestMocks();

      return runHealthTest('one', () => 'ok').then(res => {
        expect(res).to.be.instanceOf(runTests.Success);
      });
    });

    describe('retry', () => {

      it('should be Success for a test that failed 2 times but then passed', () => {
        const {runHealthTest} = runHealthTestMocks();
        const test = sinon.stub().resolves('ok');
        test.onCall(0).rejects(new Error('one'));
        test.onCall(1).rejects(new Error('two'));

        return runHealthTest('one', test).then(res => {
          expect(res).to.be.instanceOf(runTests.Success);
          expect(test).to.have.been.calledThrice;
        });
      });

      it('should run test 3 times before Failure', () => {
        const {runHealthTest} = runHealthTestMocks();
        const test = sinon.stub().rejects(new Error('one'));

        return runHealthTest('one', test).then(res => {
          expect(res).to.be.instanceOf(runTests.Failure);
          expect(test).to.have.been.calledThrice;
        });
      });
    });
  });

  it('should resolve for successful execution with result containing all tests', () => {
    const {runHealthTest} = runHealthTestMocks();
    const tests = healthTests({
      one: () => runHealthTest('one', () => Promise.resolve('ok')),
      two: () => runHealthTest('two', () => Promise.resolve('ok2'))
    });

    return run(tests)
      .then(res => expect(res).to.deep.equal({
        one: new Success('ok'),
        two: new Success('ok2')
      }));
  });

  it('should reject with error containing all results with outcomes', done => {
    const {runHealthTest} = runHealthTestMocks();
    const tests = healthTests({
      one: () => runHealthTest('one', () => Promise.resolve('ok')),
      two: () => runHealthTest('one', () => Promise.reject(new Error('wow'))),
      three: () => runHealthTest('three', () => Promise.resolve('ok'))
    });

    run(tests)
      .catch(err => {
        expect(err).to.be.instanceOf(Error);
        expect(err.outcomes).to.deep.equal({
          one: new Success('ok'),
          two: new Failure(new Error('wow')),
          three: new Success('ok')
        });
        done();
      });
  });

  describe('RunTestsError', () => {

    it('should extend system error and have proper error code', done => {
      const {runHealthTest} = runHealthTestMocks();
      const tests = healthTests({
        failing: () => runHealthTest('one', () => Promise.reject(new Error('nexted')))
      });

      run(tests).catch(err => {
        expect(err).to.be.instanceOf(Error);
        expect(err).to.have.property('errorCode', ErrorCode.HEALTH_TEST_FAILED);
        expect(err).not.to.have.property('_exposeMessage');
        done();
      });
    });
  });


  function runHealthTestMocks(opts = {}) {
    const log = sinon.createStubInstance(Logger);
    const metering = sinon.createStubInstance(WixMeasuredMetering);
    metering.promise.returns(promiseFn => () => promiseFn());
    const wrapHealthTest = wrapper({log, timeout: opts.timeout, metering});
    const runHealthTest = (name, thenable) => wrapHealthTest(name, thenable)();

    return {log, runHealthTest, wrapHealthTest, metering};
  }

  function healthTests(asMap) {
    return asMap;
  }
});
