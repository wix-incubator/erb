const Rx = require('rxjs'),
  messages = require('../messages'),
  _ = require('lodash');

module.exports.master = (fallbackFunction, log) => {
  return context => {
    const {cluster, deathRow, forkMeter, currentProcess} = context;
    const guard = id => deathRow.remove(id);
    let shouldFork = true;
    let shouldShutdown = false;
    let successStartCount = 0;

    const clusterMessageObservable = Rx.Observable.fromEvent(cluster, 'message', (worker, msg) => msg);
    const exitObservable = Rx.Observable.fromEvent(cluster, 'exit');
    const forkObservable = Rx.Observable.fromEvent(cluster, 'fork');
    const shutdownObservable = Rx.Observable.fromEvent(currentProcess, 'SIGTERM');

    forkObservable.subscribe(() => forkMeter.mark());

    shutdownObservable
      .take(1)
      .subscribe(() => {
        log.debug('received SIGTERM, initiating shutdown');
        shouldFork = false;
        shouldShutdown = true;
        broadcastYouCanDieNow(cluster, log, () => true);
        setTimeout(() => {
          log.debug('received SIGTERM, terminating after timeout');
          currentProcess.exit(1);
        }, 10000);
      });

    exitObservable
      .filter(() => shouldFork === false && shouldShutdown === true && Object.keys(cluster.workers).length === 0)
      .take(1)
      .subscribe(() => {
        log.debug('received SIGTERM, all workers have exited, terminating cleanly');
        currentProcess.exit(0);
      });

    exitObservable.subscribe(worker => {
      deathRow.remove(worker.id);
      if (Object.keys(cluster.workers).length === 0 && shouldFork === true && !forkMeter.shouldThrottle()) {
        cluster.fork();
      }
    });

    exitObservable
      .filter(() => shouldFork === false && shouldShutdown === false && Object.keys(cluster.workers).length === 0)
      .take(1)
      .subscribe(() => fallbackFunction(new Error('App terminated due to high worker death count (throttled)')));

    clusterMessageObservable
      .filter(messages.isWorkerStarted)
      .subscribe(() => {
        successStartCount += 1;
        broadcastYouCanDieNow(cluster, log, guard);
      });

    clusterMessageObservable
      .filter(messages.isWorkerFailed)
      .subscribe(msg => {
        const workerId = msg.value.workerId;
        const error = msg.value.err;
        deathRow.add(workerId);
        if (successStartCount === 0) {
          fallbackFunction(error);
        } else if (forkMeter.shouldThrottle()) {
          shouldFork = false;
          broadcastYouCanDieNow(cluster, log, () => true);
        } else {
          cluster.fork();
        }
      });

    cluster.fork();
    return Promise.resolve();
  };
};

module.exports.worker = (launchApp, stopApp) => context => {
  const {currentProcess, currentWorker, log} = context;
  let stopAppFunction = _.noop;

  const uncaughtExceptionObservable = Rx.Observable.fromEvent(currentProcess, 'uncaughtException');
  const messageObservable = Rx.Observable.fromEvent(currentProcess, 'message');

  uncaughtExceptionObservable
    .take(1)
    .subscribe(e => {
      setTimeout(() => {
        log.error(`worker with id ${currentWorker.id} did not exit within 30000 ms, terminating`);
        currentProcess.exit(1);
      }, 30000);
      currentProcess.send(messages.workerFailed(currentWorker.id, e));
    });

  messageObservable
    .filter(messages.isYouCanDieNow)
    .take(1)
    .subscribe(() => stopApp(stopAppFunction));

  return launchApp().then(stop => stopAppFunction = stop);
};

function broadcastYouCanDieNow(cluster, log, guard) {
  Object.keys(cluster.workers).forEach(id => {
    const worker = cluster.workers[id];
    if (guard(worker.id)) {
      worker.send(messages.youCanDieNow(worker.id));
      worker.disconnect();
      setTimeout(() => {
        log.debug(`Killing worker with id: ${worker.id}`);
        worker.kill('SIGKILL');
      }, 10000);
    }
  });
}
