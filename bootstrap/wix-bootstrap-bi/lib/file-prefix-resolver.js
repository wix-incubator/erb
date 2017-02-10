module.exports = cluster => {
  return cluster.isWorker ? `wix.bi.worker-${cluster.worker.id}` : 'wix.bi';
};
