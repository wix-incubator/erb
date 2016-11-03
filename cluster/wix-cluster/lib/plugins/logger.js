module.exports.master = context => {
  const log = context.log;
  return cluster => {
    cluster.on('fork', worker => log.debug('Worker with id: %s forked.', worker.id, new Date().toISOString()));
    cluster.on('online', worker => log.debug('Worker with id: %s is online.', worker.id, new Date().toISOString()));
    cluster.on('listening', worker => log.debug('Worker with id: %s is listening.', worker.id, new Date().toISOString()));
    cluster.on('disconnect', worker => log.debug('Worker with id: %s disconnected.', worker.id, new Date().toISOString()));
    cluster.on('exit', worker => log.debug('Worker with id: %s exited.', worker.id, new Date().toISOString()));
  };
};