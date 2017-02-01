const expect = require('chai').expect,
  states = require('../../lib/health/states');

describe('states', () => {

  describe('Startup', () => {

    it('has a scheduling delay of 5 seconds', () => {
      expect(startup().delay).to.equal(5000);
    });

    it('returns a Healthy state for a successful execution', () => {
      return startup()
        .next(Promise.resolve({res: 'ok'}))
        .then(nextState => expect(nextState).to.be.instanceOf(states.Healthy));
    });

    it('transfers current status for HealthyState', () => {
      return startup()
        .next(Promise.resolve({res: 'ok'}))
        .then(nextState => nextState.status)
        .then(transferedStatus => expect(transferedStatus).to.deep.equal({res: 'ok'}));
    });

    it('returns self for a failed execution', () => {
      const state = startup();

      return state.next(Promise.reject(new Error('woop')))
        .then(nextState => expect(nextState).to.equal(state));
    });

    it('recovers and moves to healthy state transfering status', () => {
      const state = startup();

      return state.next(Promise.reject(new Error('woop')))
        .then(() => state.next(Promise.resolve({res: 'ok'})))
        .then(nextState => {
          expect(nextState).to.be.instanceOf(states.Healthy);
          expect(nextState.status).to.be.instanceOf(Promise);
          return nextState.status;
        })
        .then(status => expect(status).to.deep.equal({res: 'ok'}))
    });

    it('resolves a status promise with result when successful execution result is provided for next', done => {
      const state = startup();
      const executionResult = {result: 'ok'};

      state.status.then(res => {
        expect(res).to.deep.equal(executionResult);
        done();
      });

      state.next(Promise.resolve(executionResult));
    });

    it('rejects a status promise with result when failed execution result is provided for next', done => {
      const state = startup();
      const executionResult = {result: 'nok'};

      state.status.catch(err => {
        expect(err).to.deep.equal(executionResult);
        done();
      });

      state.next(Promise.reject(executionResult));
    });
  });

  describe('Healthy', () => {

    it('has a scheduling delay of 60 seconds', () => {
      expect(healthy().delay).to.equal(60000);
    });

    it('validates for result from previous state is provided', () => {
      expect(() => new states.Healthy()).to.throw('status is mandatory');
    });

    it('is created with a result from previous state', () => {
      return healthy(Promise.resolve({res: 'ok'})).status
        .then(res => expect(res).to.deep.equal({res: 'ok'}));
    });

    it('sets new result on successful execution', () => {
      const nextResult = {res: 'next'};

      return healthy().next(Promise.resolve(nextResult))
        .then(nextState => nextState.status)
        .then(newStatus => expect(newStatus).to.equal(nextResult));
    });

    it('returns self on next for a successful execution', () => {
      const state = healthy();

      return state.next(Promise.resolve())
        .then(nextState => expect(nextState).to.equal(state));
    });

    it('switches to Unhealthy for a failed execution', () => {
      const state = healthy();

      return state.next(Promise.reject(new Error('woops')))
        .then(nextState => expect(nextState).to.be.instanceOf(states.Unhealthy));
    });

    it('forwards failing status to a Unhealthy state', done => {
      const failure = new Error('woops');
      const state = healthy();

      state.next(Promise.reject(failure))
        .then(nextState => nextState.status)
        .catch(err => {
          expect(err).to.equal(failure);
          done();
        });
    });
  });

  describe('Unhealthy', () => {

    it('has a scheduling delay of 15 seconds', () => {
      expect(unhealthy().delay).to.equal(15000);
    });

    it('validates for result from previous state is provided', () => {
      expect(() => new states.Unhealthy()).to.throw('status is mandatory');
    });

    it('is created with a result from previous state', done => {
      const failure = new Error('woop');
      unhealthy(Promise.reject(failure)).status
        .catch(res => {
          expect(res).to.equal(failure);
          done();
        });
    });

    it('returns self for a next with failure result', () => {
      const state = unhealthy();
      return state.next(Promise.reject(new Error('woop')))
        .then(newState => expect(newState).to.equal(state));
    });

    it('sets new result for a next with failure result', done => {
      const error = new Error('woop not great');
      const state = unhealthy();
      state.next(Promise.reject(error))
        .then(newState => newState.status)
        .catch(e => {
          expect(e).to.equal(error);
          done();
        });
    });

    it('does not transition to healthy for < 3 invocations with failure result', () => {
      const error = new Error('woop');
      const state = unhealthy();
      return state.next(Promise.reject(error))
        .then(newState => newState.next(Promise.reject(error)))
        .then(newState => expect(newState).to.equal(state));
    });

    it('does not switch result for a next with success if not transitioning to Healthy', () => {
      const result = Promise.resolve({res: 'ok'});
      const state = unhealthy();
      return state.next(result)
        .then(newState => {
          expect(state.status).to.not.equal(result);
          expect(newState).to.equal(state);
        });
    });

    it('it goes back to Healthy state after 3 transition attempts with successful execution', () => {
      const result = Promise.resolve({res: 'ok'});
      const state = unhealthy();
      return state.next(result)
        .then(newState => newState.next(result))
        .then(newState => newState.next(result))
        .then(newState => expect(newState).to.be.instanceOf(states.Healthy));
    });

    it('passes result to HealthyState upon switch', () => {
      const result = Promise.resolve({res: 'ok'});
      const state = unhealthy();
      return state.next(result)
        .then(newState => newState.next(result))
        .then(newState => newState.next(result))
        .then(newState => expect(newState.status).to.equal(result));
    });

  });

  function startup() {
    return new states.Startup();
  }

  function healthy(status = Promise.resolve()) {
    return new states.Healthy(status);
  }

  function unhealthy(status = Promise.resolve()) {
    return new states.Unhealthy(status);
  }
});
