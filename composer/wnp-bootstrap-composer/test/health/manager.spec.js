const expect = require('chai').use(require('sinon-chai')).use(require('chai-as-promised')).expect,
  sinon = require('sinon'),
  HealthManager = require('../../lib/health/manager'),
  states = require('../../lib/health/states').delays,
  _ = require('lodash'),
  Promise = require('bluebird'),
  run = require('../../lib/health/run-tests');

require('sinon-as-promised');

describe('health manager', () => {
  
  describe('add', () => {

    it('should validate input for #add', () => {
      expect(() => new HealthManager().add()).to.throw('name is mandatory and must be a string');
      expect(() => new HealthManager().add({})).to.throw('name is mandatory and must be a string');
      expect(() => new HealthManager().add('test')).to.throw('fn is mandatory and must be a function');
      expect(() => new HealthManager().add('test', {})).to.throw('fn is mandatory and must be a function');
    });

    it('should fail when adding multiple health tests with same name', () => {
      expect(() => new HealthManager()
        .add('one', _.noop)
        .add('one', _.noop)).to.throw('health test \'one\' is already present');
    });

    it('should allow to add both promisified and non-promisified tests', () => {
      const manager = new HealthManager()
        .add('one', () => 'ok')
        .add('two', () => Promise.resolve('promisified-ok'));


      return manager.start()
        .then(() => manager.status)
        .then(res => expect(res).to.deep.equal({
          'one': new run.Success('ok'),
          'two': new run.Success('promisified-ok')
        }));
    });
  });


  describe('stop', () => {
    it('should clear timeout on stop', () => {
      const healthTest = sinon.stub().resolves('ok');
      const manager = new HealthManager(fn => setTimeout(fn, 10));

      return manager.add('first', healthTest).start()
        .then(() => manager.status)
        .then(() => healthTest.reset())
        .then(() => manager.stop())
        .then(() => Promise.delay(50))
        .then(() => expect(healthTest.callCount).to.be.below(2));
    });
  });

  describe('status', () => {
    let manager = {stop: _.noop};

    afterEach(() => manager.stop());

    it('should return a list of tests with outcomes for successful execution', () => {
      manager = new HealthManager()
        .add('first', () => Promise.resolve('ok'))
        .add('second', () => Promise.resolve('ok2'));

      return manager.start()
        .then(() => manager.status)
        .then(res => expect(res).to.deep.equal({
          'first': new run.Success('ok'),
          'second': new run.Success('ok2')
        }));
    });

    it('should return a list of tests with outcomes for failed execution', done => {
      manager = new HealthManager()
        .add('first', () => Promise.resolve('ok'))
        .add('second', () => Promise.reject(new Error('woop')));

      manager.start()
        .then(() => manager.status)
        .catch(err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.outcomes).to.deep.equal({
            'first': new run.Success('ok'),
            'second': new run.Failure(new Error('woop'))
          });
          done();
        });
    });
  });

  describe('execution', () => {

    it('should run health tests on start', done => {
      const healthTest = sinon.stub().resolves('ok');
      const {manager} = healthManager();

      manager.status.then(() => {
        expect(healthTest).to.have.been.calledOnce;
        done();
      });

      manager
        .add('first', healthTest)
        .start()
    });

    it('should schedule next run according to a Healthy state periodicity on successful start', () => {
      const healthTest = sinon.stub().resolves('ok');
      const {manager, mockSetTimeout} = healthManager({'first': healthTest});

      return manager.start()
        .then(() => expect(mockSetTimeout).to.have.been.calledWithMatch(sinon.match.any, states.healthy));
    });

    it('should schedule execution periodically', () => {
      const healthTest = sinon.stub().resolves('ok');
      const {manager, mockSetTimeout} = healthManager({'first': healthTest});

      return manager.start()
        .then(() => {
          expect(mockSetTimeout.calledOnce).to.equal(true);
          return mockSetTimeout.firstCall.args[0](healthTest);
        }).then(() => {
          expect(mockSetTimeout.calledTwice).to.equal(true);
          return mockSetTimeout.secondCall.args[0](healthTest);
        });
    });

    it('should schedule next run according to a Startup state periodicity on failure', () => {
      const healthTest = sinon.stub().rejects(new Error('woop'));
      const {manager, mockSetTimeout} = healthManager({'first': healthTest});

      return manager.start()
        .then(() => expect(mockSetTimeout).to.have.been.calledWithMatch(sinon.match.any, states.startup));
    });
  });

  function healthManager(tests = {}) {
    const mockSetTimeout = sinon.spy();
    const manager = new HealthManager(mockSetTimeout);
    Object.keys(tests).forEach(k => manager.add(k, tests[k]));
    return {manager, mockSetTimeout};
  }
});
