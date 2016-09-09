'use strict';

module.exports.onMaster = (cluster, process, log) => {
  process.on('uncaughtException', e => log.error(e));
  cluster.on('fork', worker => log.debug(`Worker with id: ${worker.id} forked.`));
  cluster.on('online', worker => log.debug(`Worker with id: ${worker.id} is online.`));
  cluster.on('listening', worker => log.debug(`Worker with id: ${worker.id} is listening.`));
  cluster.on('disconnect', worker => log.debug(`Worker with id: ${worker.id} disconnected.`));
  cluster.on('exit', worker => log.debug(`Worker with id: ${worker.id} exited.`));
};