module.exports = (currentProcess, currentWorker, log) => {
  return stopFn => {
    return Promise.resolve()
      .then(stopFn)
      .then(() => {
        log.debug(`Worker with id: '${currentWorker.id}' shutdown completed`);
        currentProcess.exit(0);
      })
      .catch(e => {
        log.error(`worker with id: '${currentWorker.id}' shutdown failed: `, e);
        currentProcess.exit(-1);
      });
  }
};