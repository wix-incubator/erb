const expect = require('chai').use(require('sinon-chai')).expect,
  sinon = require('sinon'),
  reporter = require('..'),
  EventEmitter = require('events'),
  Logger = require('wnp-debug').Logger;

describe('wix-express-newrelic-reporter', () => {
  const newRelicConfig = {NEW_RELIC_NO_CONFIG_FILE: true, NEW_RELIC_ENABLED: false, NEW_RELIC_LOG: 'stdout'};

  afterEach(() => Object.keys(newRelicConfig).forEach(key => delete process.env[key]));

  ['x-error', 'x-timeout'].forEach(event => {

    describe(`for ${event}`, () => {

      it('should report errors to new relic emitted on response', sinon.test(function (done) {
        const {newrelic, middleware, transaction, req, res} = mocks(this);
        const error = new Error('woops');

        middleware(req, res, () => {
          res.emit(event, error);
          expect(newrelic.agent.errors.addUserError).to.have.been.calledWith(transaction, error).calledOnce;
          done();
        });
      }));

      it('should report single error to new relic on multiple emitted events', sinon.test(function (done) {
        const {newrelic, middleware, transaction, req, res} = mocks(this);
        const error = new Error('woops');

        middleware(req, res, () => {
          res.emit(event, error);
          res.emit(event, error);
          expect(newrelic.agent.errors.addUserError).to.have.been.calledWith(transaction, sinon.match.any).calledOnce;
          done();
        });
      }));

      it('should log error and add noop middleware when failing to get new relic transaction', sinon.test(function (done) {
        const {newrelic, middleware, log, req, res} = mocks(this);
        const error = new Error('woops');
        newrelic.agent.tracer.getTransaction.throws(new Error('no transaction'));

        middleware(req, res, () => {
          res.emit(event, error);
          expect(newrelic.agent.errors.addUserError).to.not.have.been.called;
          expect(log.error).to.have.been.calledWithMatch(sinon.match('Failed getting new relic transaction', sinon.match.any));
          done();
        });
      }));

      it('should log error if failing to report error', sinon.test(function (done) {
        const {newrelic, middleware, log, req, res} = mocks(this);
        const error = new Error('woops');
        newrelic.agent.errors.addUserError.throws(new Error('failed when adding error'));

        middleware(req, res, () => {
          res.emit(event, error);
          expect(log.error).to.have.been.calledWithMatch(sinon.match('Failed reporting error'), sinon.match.any);
          done();
        });
      }));
    });
  });

  it('should be disabled if running against stub new relic instance', () => {
    Object.assign(process.env, newRelicConfig);
    const newrelic = require('newrelic');
    const log = sinon.createStubInstance(Logger);
    reporter(newrelic, log);

    expect(log.debug).to.have.been.calledWithMatch('Stub new relic loaded - new relic error reporter not loaded');
  });

  function mocks(ctx) {
    const transaction = 't';
    const log = sinon.createStubInstance(Logger);
    const req = new EventEmitter();
    const res = new EventEmitter();
    const newrelic = {
      agent: {
        tracer: {
          getTransaction: ctx.stub().returns(transaction)
        },
        errors: {
          addUserError: ctx.stub()
        }
      }
    };
    const middleware = reporter(newrelic, log);
    return {middleware, log, newrelic, transaction, req, res};
  }
});
