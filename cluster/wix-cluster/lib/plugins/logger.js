module.exports.master = log => context => {
  const {cluster} = context;
  cluster.on('fork', worker => log.debug('Worker with id: %s forked.', worker.id));
  cluster.on('online', worker => log.debug('Worker with id: %s is online.', worker.id));
  cluster.on('listening', worker => log.debug('Worker with id: %s is listening.', worker.id));
  cluster.on('disconnect', worker => log.debug('Worker with id: %s disconnected.', worker.id));
  cluster.on('exit', worker => log.debug('Worker with id: %s exited.', worker.id));
};

module.exports.worker = log => context => {
  const {currentWorker, currentProcess} = context;
  currentProcess.on('uncaughtException', e => log.error('Worker with id: %s threw uncaughtException: ', currentWorker.id, e));
};
