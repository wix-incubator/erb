const expect = require('chai').use(require('sinon-chai')).use(require('chai-as-promised')).expect,
  sinon = require('sinon'),
  runTests = require('../../lib/health/run-tests'),
  run = runTests.run,
  Success = runTests.Success,
  Failure = runTests.Failure,
  Promise = require('bluebird');

require('sinon-as-promised');

describe('run-tests', () => {

  it('should resolve for successful execution with result containing all tests', () => {
    const tests = healthTests({
      one: () => Promise.resolve('ok'),
      two: () => Promise.resolve('ok2')
    });

    return run(tests)
      .then(res => expect(res).to.deep.equal({
        one: new Success('ok'),
        two: new Success('ok2')
      }));
  });

  it('should reject with error containing all results with outcomes', done => {
    const tests = healthTests({
      'one': () => Promise.resolve('ok'),
      'two': () => Promise.reject(new Error('wow'))
    });

    run(tests)
      .catch(err => {
        expect(err).to.be.instanceOf(Error);
        expect(err.outcomes).to.deep.equal({
          one: new Success('ok'),
          two: new Failure(new Error('wow'))
        });
        done();
      });
  });

  it('should be rejected if test took longer that provided timeout', done => {
    const tests = healthTests({
      'one': () => Promise.delay(1000)
    });

    run(tests, 500).catch(err => {
      expect(err.outcomes.one).to.be.instanceOf(Failure);
      expect(err.outcomes.one.toString()).to.be.string('TimeoutError');
      done();
    });
  });

  describe('retry', () => {

    it('should pass for a test that failed 2 times but then passed', () => {
      const test = sinon.stub().resolves('ok');
      test.onCall(0).rejects(new Error('one'));
      test.onCall(1).rejects(new Error('two'));

      const tests = healthTests({'one': test});

      return run(tests).then(() => {
        expect(test).to.have.been.calledThrice;
      });
    });

    it('should run test 3 times before failure', done => {
      const test = sinon.stub().rejects(new Error('one'));

      const tests = healthTests({'one': test});

      run(tests).catch(() => {
        expect(test).to.have.been.calledThrice;
        done();
      });
    });
  });

  it('should convert functions to promises', () => {
    const tests = healthTests({one: () => 'ok'});

    return run(tests).then(res => expect(res).to.deep.equal({one: new Success('ok')}));
  });

  it('should resolve for successful executions', () => {
    const tests = healthTests({
      one: () => Promise.resolve('ok'),
      two: () => Promise.resolve('ok2')
    });

    return expect(run(tests)).to.be.fulfilled;
  });

  it('should reject for a failed execution', () => {
    const tests = healthTests({
      'one': () => Promise.resolve('ok'),
      'two': () => Promise.reject(new Error('wow'))
    });

    return expect(run(tests)).to.be.rejected;
  });

  function healthTests(asMap) {
    return asMap;
  }
});
