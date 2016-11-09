const Rx = require('rxjs'),
  messages = require('../messages'),
  _ = require('lodash');

module.exports.master = (fallbackFunction, log) => {
  return context => {
    const {cluster, deathRow, forkMeter} = context;
    const guard = id => deathRow.remove(id);
    let shouldFork = true;
    let successStartCount = 0;

    const clusterMessageObservable = Rx.Observable.fromEvent(cluster, 'message', (worker, msg) => msg);
    const exitObservable = Rx.Observable.fromEvent(cluster, 'exit');
    const forkObservable = Rx.Observable.fromEvent(cluster, 'fork');

    forkObservable.subscribe(() => forkMeter.mark());
    exitObservable.subscribe(worker => {
      deathRow.remove(worker.id);
      if (Object.keys(cluster.workers).length === 0 && shouldFork === true && !forkMeter.shouldThrottle()) {
        cluster.fork();
      }
    });

    exitObservable
      .filter(() => shouldFork === false && Object.keys(cluster.workers).length === 0)
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
  const {currentProcess, currentWorker} = context;
  let stopAppFunction = _.noop;
  const uncaughtExceptionObservable = Rx.Observable.fromEvent(currentProcess, 'uncaughtException');
  const messageObservable = Rx.Observable.fromEvent(currentProcess, 'message');

  uncaughtExceptionObservable
    .take(1)
    .subscribe(e => {
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
