module.exports.master = context => {
  const {log} = context;
  const killTimeout = 5000;
  return cluster => {
    cluster.on('disconnect', worker => {
      setTimeout(() => {
        if (!worker.isDead()) {
          worker.kill();
          log.info('Worker with id %s killed', worker.id);
        } else {
          log.info('Worker with id %s died, not killing anymore', worker.id);
        }
      }, killTimeout);
      log.info('Created kill-timer for worker with id %s.', worker.id, new Date().toISOString());
    });
  };
};

module.exports.worker = context => {
  const {currentProcess, log, shutdownAppProvider} = context;
  return worker => {
    currentProcess.on('uncaughtException', err => {
      log.error(`Worker with id: ${worker.id} encountered "uncaughtException"`, err);
      try {
        if (worker.isConnected() && !worker.isDead()) {
          worker.disconnect();
        }
        shutdownAppProvider();
      } catch (e) {
        log.error('Failed disconnecting worker: ', e);
      }
    });
  };
};