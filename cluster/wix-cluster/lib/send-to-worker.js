module.exports = log => (worker, msg) => {
  try {
    if (worker && worker.isConnected() && !worker.isDead()) {
      worker.send(msg);
    }
  } catch (e) {
    log.error('failed sending message to worker: %s with error', worker.id, e);
  }
};