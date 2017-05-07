const expect = require('chai').use(require('sinon-chai')).use(require('chai-things')).expect,
  sinon = require('sinon'),
  engine = require('../../lib/engine'),
  messages = require('../../lib/messages'),
  mocks = require('../support/mocks'),
  DeathRow = require('../../lib/engine/death-row'),
  ForkMeter = require('../../lib/engine/fork-meter'),
  Logger = require('wnp-debug').Logger;

require('sinon-as-promised');

describe('engine', () => {

  describe('master', () => {

    it('should fork a worker on startup', sinon.test(function () {
      const {currentProcess} = mocks.process();
      const cluster = mocks.cluster(this);

      engine.master()({cluster, currentProcess});

      expect(cluster.fork).to.have.been.calledOnce;
    }));

    it('should mark throttler on fork', sinon.test(function () {
      const forkMeter = sinon.createStubInstance(ForkMeter);
      const {currentProcess} = mocks.process();
      const cluster = mocks.cluster(this);

      engine.master()({forkMeter, cluster, currentProcess});
      cluster.emit('fork', {});

      expect(forkMeter.mark).to.have.been.calledOnce;
    }));


    it('should remove item from death-row given worker exited', sinon.test(function () {
      const cluster = mocks.cluster(this);
      const {currentProcess} = mocks.process();
      const worker = mocks.worker(this);
      const fallbackFunction = this.spy();
      const deathRow = sinon.createStubInstance(DeathRow);
      const forkMeter = sinon.createStubInstance(ForkMeter);
      forkMeter.shouldThrottle.returns(false);

      engine.master(fallbackFunction)({cluster, deathRow, forkMeter, currentProcess});
      cluster.emit('exit', worker);

      expect(deathRow.remove).to.have.been.calledWith(worker.id);
    }));

    it('should kill workers in death row once new worker started', sinon.test(function () {
      const log = sinon.createStubInstance(Logger);
      const {currentProcess} = mocks.process();
      const startedWorker = mocks.worker(this, 1).worker;
      const workerInDeathRow = mocks.worker(this, 2).worker;
      const cluster = mocks.cluster(this, [startedWorker, workerInDeathRow]);
      const deathRow = sinon.createStubInstance(DeathRow);

      deathRow.remove.withArgs(workerInDeathRow.id).returns(true);

      engine.master(null, log)({deathRow, cluster, currentProcess});

      cluster.emit('message', startedWorker, messages.workerStarted(startedWorker.id));

      expect(workerInDeathRow.disconnect).to.have.been.calledOnce;
      expect(workerInDeathRow.kill).to.not.have.been.called;

      this.clock.tick(10000);

      expect(workerInDeathRow.kill).to.have.been.calledWith('SIGKILL').calledOnce;
      expect(log.debug).to.have.been.calledWith(sinon.match('Killing worker')).calledOnce;
    }));

    it('should kill all workers given rapid worker fork/exit rate', sinon.test(function () {
      const log = sinon.createStubInstance(Logger);
      const {currentProcess} = mocks.process();
      const deathRow = sinon.createStubInstance(DeathRow);
      const failingWorker = mocks.worker(this, 1).worker;
      const cluster = mocks.cluster(this, [failingWorker]);
      const forkMeter = sinon.createStubInstance(ForkMeter);
      forkMeter.shouldThrottle.returns(true);

      engine.master(null, log)({deathRow, forkMeter, cluster, currentProcess});

      cluster.emit('message', failingWorker, messages.workerStarted(failingWorker.id));
      cluster.emit('message', failingWorker, messages.workerFailed(failingWorker.id, new Error('woops')));

      expect(failingWorker.disconnect).to.have.been.calledOnce;
      expect(failingWorker.kill).to.not.have.been.called;

      this.clock.tick(10000);

      expect(failingWorker.kill).to.have.been.calledWith('SIGKILL').calledOnce;
    }));

    it('should load fallback app given last worker exited and forking was throttled', sinon.test(function () {
      const {currentProcess} = mocks.process();
      const fallbackFunction = sinon.spy();
      const log = sinon.createStubInstance(Logger);
      const deathRow = sinon.createStubInstance(DeathRow);
      const failingWorker = mocks.worker(this, 1).worker;
      const cluster = mocks.cluster(this);
      const forkMeter = sinon.createStubInstance(ForkMeter);
      forkMeter.shouldThrottle.returns(true);

      engine.master(fallbackFunction, log)({deathRow, forkMeter, cluster, currentProcess});

      cluster.emit('message', failingWorker, messages.workerStarted(failingWorker.id));
      cluster.emit('message', failingWorker, messages.workerFailed(failingWorker.id, new Error('woops')));
      this.clock.tick(10000);

      cluster.emit('exit', failingWorker);
      expect(fallbackFunction).to.have.been.calledOnce;
    }));


    it('should add worker to death row on failure and fork a new worker', sinon.test(function () {
      const {currentProcess} = mocks.process();
      const log = sinon.createStubInstance(Logger);
      const failingWorker = mocks.worker(this, 1);
      const cluster = mocks.cluster(this, [failingWorker]);
      const deathRow = sinon.createStubInstance(DeathRow);
      const forkMeter = sinon.createStubInstance(ForkMeter);
      forkMeter.shouldThrottle.returns(false);

      engine.master(null, log)({deathRow, forkMeter, cluster, currentProcess});
      cluster.fork.reset();

      cluster.emit('message', failingWorker, messages.workerStarted(failingWorker.id));
      cluster.emit('message', failingWorker, messages.workerFailed(failingWorker.id, new Error('woops')));

      expect(deathRow.add).to.have.been.calledWith(failingWorker.id).calledOnce;
      expect(cluster.fork).to.have.been.calledOnce;
    }));

    it('should invoke callback function if first worker failed to start', sinon.test(function () {
      const fallbackFunction = sinon.spy();
      const {currentProcess} = mocks.process();
      const log = sinon.createStubInstance(Logger);
      const failingWorker = mocks.worker(this, 1);
      const cluster = mocks.cluster(this, [failingWorker]);
      const deathRow = sinon.createStubInstance(DeathRow);

      engine.master(fallbackFunction, log)({deathRow, cluster, currentProcess});
      cluster.fork.reset();

      cluster.emit('message', failingWorker, messages.workerFailed(failingWorker.id, new Error('woops')));

      expect(deathRow.add).to.have.been.calledWith(failingWorker.id).calledOnce;
      expect(fallbackFunction).to.have.been.calledWith(sinon.match.has('name', 'Error')).calledOnce;
      expect(cluster.fork).to.not.have.been.called;
    }));

    it('should restart worker if it exited without explicitly notifying about failure and forking conditions are met', sinon.test(function () {
      const log = sinon.createStubInstance(Logger);
      const {currentProcess} = mocks.process();
      const failingWorker = mocks.worker(this, 1).worker;
      const cluster = mocks.cluster(this, []);
      const deathRow = sinon.createStubInstance(DeathRow);
      const forkMeter = sinon.createStubInstance(ForkMeter);
      forkMeter.shouldThrottle.returns(false);

      engine.master(null, log)({deathRow, cluster, forkMeter, currentProcess});
      cluster.fork.reset();

      cluster.emit('exit', failingWorker);

      expect(deathRow.remove).to.have.been.calledWith(failingWorker.id).calledOnce;
      expect(cluster.fork).to.have.been.calledOnce;
    }));

    it('should listen on SIGTERM and shutdown app cleanly once all workers exited', sinon.test(function (done) {
      const {currentProcess} = mocks.process(this);
      const log = sinon.createStubInstance(Logger);
      const {worker, collectedMessages} = mocks.worker(this, 1);
      const cluster = mocks.cluster(this, [worker]);
      const deathRow = sinon.createStubInstance(DeathRow);
      const forkMeter = sinon.createStubInstance(ForkMeter);

      engine.master(null, log)({deathRow, cluster, forkMeter, currentProcess});
      currentProcess.emit('SIGTERM');

      expect(collectedMessages).to.contain.an.item.that.satisfies(messages.isYouCanDieNow);
      expect(worker.disconnect).to.have.been.calledOnce;
      expect(log.debug).to.have.been.calledWith(sinon.match('initiating shutdown'));

      currentProcess.onExit(code => {
        expect(log.debug).to.have.been.calledWith(sinon.match('terminating cleanly'));
        expect(code).to.equal(0);
        done();
      });

      cluster.onWorkerExit(worker);
    }));

    it('should listen on SIGTERM and force-terminate app after timeout', sinon.test(function (done) {
      const {currentProcess} = mocks.process(this);
      const log = sinon.createStubInstance(Logger);
      const {worker} = mocks.worker(this, 1);
      const cluster = mocks.cluster(this, [worker]);
      const deathRow = sinon.createStubInstance(DeathRow);
      const forkMeter = sinon.createStubInstance(ForkMeter);

      engine.master(null, log)({deathRow, cluster, forkMeter, currentProcess});
      currentProcess.emit('SIGTERM');

      expect(log.debug).to.have.been.calledWith(sinon.match('initiating shutdown'));

      currentProcess.onExit(code => {
        expect(log.debug).to.have.been.calledWith(sinon.match('terminating after timeout'));
        expect(code).to.equal(1);
        done();
      });

      this.clock.tick(10000);
    }));

  });

  describe('worker', () => {

    it('should fork a worker on startup', sinon.test(function () {
      const {currentProcess} = mocks.process();
      const currentWorker = mocks.worker(this);
      const launchApp = this.stub().resolves('ok');
      engine.worker(launchApp)({currentProcess, currentWorker});

      expect(launchApp).to.have.been.calledOnce;
    }));

    it('should send a single worker failed message to master on uncaughtException', sinon.test(function () {
      const log = sinon.createStubInstance(Logger);
      const launchApp = this.stub().resolves('ok');
      const {currentProcess, collectedMessages} = mocks.process();
      const currentWorker = mocks.worker(this);

      return engine.worker(launchApp)({currentProcess, currentWorker, log})
        .then(() => {
          expect(launchApp).to.have.been.calledOnce;
          currentProcess.emit('uncaughtException', new Error('woops'));
          currentProcess.emit('uncaughtException', new Error('woops2'));
          expect(collectedMessages).to.have.length(1);
          expect(collectedMessages).to.contain.an.item.that.satisfies(messages.isWorkerFailed);
        });
    }));

    it('should send a single worker failed message to master on uncaughtException', sinon.test(function (done) {
      const log = sinon.createStubInstance(Logger);
      const launchApp = this.stub().resolves('ok');
      const {currentProcess} = mocks.process();
      const currentWorker = mocks.worker(this, 1).worker;

      engine.worker(launchApp)({currentWorker, currentProcess, log}).then(() => {
        expect(launchApp).to.have.been.calledOnce;
        currentProcess.emit('uncaughtException', new Error('woops'));

        currentProcess.onExit(code => {
          expect(code).to.equal(1);
          expect(log.error).to.have.been.calledWith(sinon.match('worker with id 1 did not exit')).calledOnce;
          done();
        });

        this.clock.tick(30000);
      });
    }));

    it.skip('should set timer on failure for suicide in case ex. process.send fails or other error that occurs during shutdown sequence', () => {
      const launchApp = this.stub().resolves('ok');
      const {currentProcess, collectedMessages} = mocks.process();
      const currentWorker = mocks.worker(this);

      return engine.worker(launchApp)({currentWorker, currentProcess})
        .then(() => {
          expect(launchApp).to.have.been.calledOnce;
          currentProcess.emit('uncaughtException', new Error('woops'));
          currentProcess.emit('uncaughtException', new Error('woops2'));
          expect(collectedMessages).to.have.length(1);
          expect(collectedMessages).to.contain.an.item.that.satisfies(messages.isWorkerFailed);
        });
    });

    it('should suicide on you-can-die-now message from master', sinon.test(function () {
      const stopFn = this.spy();
      const stopApp = this.spy();
      const launchApp = this.stub().resolves(stopFn);
      const {currentProcess} = mocks.process();
      const currentWorker = mocks.worker(this);

      return engine.worker(launchApp, stopApp)({currentWorker, currentProcess})
        .then(() => {
          currentProcess.send(messages.youCanDieNow());
          currentProcess.send(messages.youCanDieNow());

          expect(stopApp).to.have.been.calledWith(stopFn).calledOnce;
        });
    }));
  });
});