const cluster = require('cluster');

module.exports = () => {
  if (cluster.isMaster) {
    const express = require('express');
    const stats = {
      disconnect: 0,
      exit: 0,
      maxWorkerCount: 0
    };

    const getStats = () => {
      stats.workerCount = Object.keys(cluster.workers).length;
      return stats;
    };

    cluster.on('fork', () => {
      const workerCount = Object.keys(cluster.workers).length;
      if (workerCount > stats.maxWorkerCount) {
        stats.maxWorkerCount = workerCount;
      }
    });
    cluster.on('disconnect', () => stats.disconnect = stats.disconnect + 1);
    cluster.on('exit', () => stats.exit = stats.exit + 1);


    express()
      .get('/stats', (req, res) => {
        res.json(getStats());
      })
      .listen(3004, () => console.log('stats for tests listening'));
  }
};
