'use strict';
const cluster = require('cluster'),
  log = require('wnp-debug')('wix-cluster'),
  messages = require('./registry/messages'),
  DeathRow = require('./registry/death-row'),
  Throttler = require('./registry/throttler'),
  clusterLogger = require('./plugins/cluster-logger'),
  statsEmitter = require('./plugins/stats-emitter');

module.exports.run = (appFunction, opts) => {

  if (cluster.isMaster) {
    const context = buildMasterContext(cluster, opts);
    const deathRow = context.deathRow;
    const throttler = new Throttler(cluster);

    clusterLogger.onMaster(cluster, process, log);
    statsEmitter.onMaster(cluster, context);

    cluster.on('exit', () => {
      if ((Object.keys(cluster.workers).length === 0) && context.shouldFork === false) {
        context.fallbackFunction(new Error('App terminated due to high worker death count (throttled)'));
      }
    });

    cluster.on('message', (worker, msg) => {
      if (messages.isWorkerStarted(msg)) {
        context.successStartCount = context.successStartCount + 1;
        emitYouCanDieNow(deathRow);
      }

      if (messages.isWorkerFailed(msg) && !deathRow.contains(worker.id)) {
        deathRow.add(worker.id);
        if (context.successStartCount === 0) {
          context.fallbackFunction(msg.data);
        } else if (throttler.shouldThrottle()) {
          context.shouldFork = false;
          Object.keys(cluster.workers).forEach(id => {
            const worker = cluster.workers[id];
            worker.send(messages.youCanDieNow(worker.id));
            worker.disconnect();
            setTimeout(() => {
              log.debug(`Killing worker with id: ${worker.id}`);
              worker.kill('SIGKILL');
            }, 10000);
          });
        } else {
          cluster.fork();
        }
      }
    });

    cluster.fork();
  } else {
    // const worker = cluster.worker;
    // const context = buildWorkerContext(appFunction);
    // statsEmitter.onWorker(cluster, process);

    // process.on('uncaughtException', e => log.error(e));
    process.on('uncaughtException', e => {
      if (context.uncaughtExceptionEmitted !== true) {
        process.send(messages.workerFailed(cluster.worker.id, e));
        context.uncaughtExceptionEmitted = true;
      }
    });

    process.on('message', msg => {
      if (messages.isYouCanDieNow(msg) && context.suicideInProgress === false) {
        context.suicideInProgress = true;

        Promise.resolve()
          .then(context.stopFunction)
          .then(() => log.debug(`Worker with id: '${worker.id}' shutdown completed`))
          .then(() => process.exit(0))
          .catch(e => {
            log.error(`worker with id: '${worker.id}' shutdown failed: `, e);
            process.exit(-1);
          });
      }
    });

    Promise.resolve()
      .then(context.appFunction)
      .then(stop => context.stopFunction = stop)
      .then(() => process.send(messages.workerStarted(worker.id)))
      .catch(e => {
        process.send(messages.workerFailed(worker.id, e));
        process.exit(-1);
      });
  }
};

function buildMasterContext(cluster, opts) {
  const ctx = {
    successStartCount: 0,
    shouldFork: true,
    deathRow: new DeathRow(cluster),
    fallbackFunction: err => console.error('Worker failed to boot, not restarting: ', err)
  };

  if (opts && opts.fallback) {
    ctx.fallbackFunction = opts.fallback;
  }

  return ctx;
}

function buildWorkerContext(appFn) {
  return {
    suicideInProgress: false,
    uncaughtExceptionEmitted: false,
    appFunction: appFn,
    stopFunction: () => {
    }
  };
}

function emitYouCanDieNow(deathRow) {
  Object.keys(cluster.workers).forEach(id => {
    const worker = cluster.workers[id];
    if (deathRow.contains(worker.id)) {
      worker.send(messages.youCanDieNow(worker.id));
      worker.disconnect();
      setTimeout(() => {
        log.debug(`Killing worker with id: ${worker.id}`);
        worker.kill('SIGKILL');
      }, 10000);
    }
  });
}