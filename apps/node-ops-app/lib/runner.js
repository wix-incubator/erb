'use strict';
const cluster = require('cluster');

let stoppable = () => {};

const deathRow = {};
const ready = {};
let forked = 1;
let killed = 0;

module.exports = fn => {

  if (cluster.isMaster) {
    const Statsd = require('node-statsd');
    const client = new Statsd({
      host: 'metrics.wixpress.com',
      global_tags: ['app_name=node-ops-app', `hostname=${process.env.HOSTNAME || 'localhost'}`]
    });

    setInterval(() => {
      client.gauge('forked', forked);
      client.gauge('killed', forked);
      client.gauge('active', Object.keys(cluster.workers).length);
    }, 5000);

    //record events from workers when they are dying;
    cluster.on('message', (worker, msg) => {
      if (msg && msg.src && msg.src === 'worker' && msg.event && msg.event === 'death') {
        if (!deathRow[msg.id]) {
          console.log(`Added worker with id: ${msg.id} to death row`);
          deathRow[msg.id] = 'waiting';
          console.log(`Forking new worker`);
          const worker = cluster.fork();
          forked++;
          console.log(`Forked new worker with id: ${worker.id}`);
        } else {
          console.log(`Worker with id ${msg.id} already in death row, not spawning`);
        }
      }
    });
    //fork when process exits
    cluster.on('disconnect', worker => {
      console.log(`Worker with id: ${worker.id} disconnected`);
    });
    //TODO: need to check once 2 http servers are listening, now just 1
    cluster.on('listening', worker => {
      console.log(`Worker with id: ${worker.id} listening`);

      if (ready[worker.id]) {
        ready[worker.id] = 2;
      } else {
        ready[worker.id] = 1;
      }


      if (ready[worker.id] === 2) {
        delete ready[worker.id];
        Object.keys(cluster.workers).forEach(id => {
          const worker = cluster.workers[id];
          if (deathRow[worker.id + '']) {
            delete deathRow[worker.id + ''];
            console.log(`killing worker: ${worker.id}`);
            worker.send('shutdown');
            killed++;
            // worker.disconnect();
            setTimeout(() => worker.kill(), 4000);
              worker.kill();
              console.log(`Worker with id: ${worker.id} killed`);
          }
        });
      }
    });

    const worker = cluster.fork();
    console.log(`Forked new worker with id: ${worker.id}`);

  } else {

    process.on('message', msg => {
      if (msg === 'shutdown') {
        console.log('received shutdown');
        Promise.resolve()
          .then(stoppable)
          .then(() => {
            console.log('completed shutdown');
            process.exit();
          })
          .catch(() => {
            console.log('failed to shutdown');
            process.exit();
          });
      }
    });

    process.on('uncaughtException', err => {
      console.log('uncaught');
      process.send({src: 'worker', event: 'death', id: cluster.worker.id});
    });

    stoppable = fn();
  }
};
