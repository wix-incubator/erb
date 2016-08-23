'use strict';
const cluster = require('cluster');

let stoppable = () => {
};

const deathRow = {};
const ready = {};

module.exports = fn => {

  if (cluster.isMaster) {
    //record events from workers when they are dying;
    cluster.on('message', (worker, msg) => {
      if (msg && msg.src && msg.src === 'worker' && msg.event && msg.event === 'death') {
        console.log(`Added worker with id: ${msg.id} to death row`);
        deathRow[msg.id] = 'waiting';
        console.log(`Forking new worker`);
        const worker = cluster.fork();
        console.log(`Forked new worker with id: ${worker.id}`);
      }
    });
    //fork when process exits
    cluster.on('disconnect', worker => {
      console.log(`Worker with id: ${worker.id} disconnected`);
    });
    //TODO: need to check once 2 http servers are listening, now just 1
    cluster.on('listening', worker => {
      console.log(`Worker with id: ${worker.id} listening`);
      Object.keys(cluster.workers).forEach(id => {
        const worker = cluster.workers[id];
        if (deathRow[worker.id]) {
          delete deathRow[worker.id];
          worker.kill();
          console.log(`Worker with id: ${worker.id} killed`);
        }
      });
    });

    const worker = cluster.fork();
    console.log(`Forked new worker with id: ${worker.id}`);

  } else {
    process.on('uncaughtException', err => {
      console.log('uncaught');
      process.send({src: 'worker', event: 'death', id: cluster.worker.id});
    });

    stoppable = fn();
  }
};
