'use strict';
const cluster = require('cluster'),
  measured = require('measured');

let stoppable = () => {};

const deathRow = {};
const ready = {};

module.exports = fn => {

  if (cluster.isMaster) {
    const Statsd = require('node-statsd');
    const client = new Statsd({host: 'sensu01.aus.wixpress.com'});
    const forked = new measured.Meter({rateUnit: 60000});
    const killed = new measured.Meter({rateUnit: 60000});
    const active = new measured.Gauge(() => Object.keys(cluster.workers).length);

    const host = (process.env.HOSTNAME || 'localhost').split('.').join('_');
    const prefix = `root=app_info.app_name=node-ops-app.host=${host}.tag=cluster`;

    setInterval(() => {
      client.gauge(`${prefix}.stat=forked.rate=per-minute.m1_rate`, forked.toJSON()['1MinuteRate']);
      client.gauge(`${prefix}.stat=killed.rate=per-minute.m1_rate`, killed.toJSON()['1MinuteRate']);
      client.gauge(`${prefix}.stat=active.gauge=total`, active.toJSON());
    }, 30000);

    //record events from workers when they are dying;
    cluster.on('message', (worker, msg) => {
      if (msg && msg.src && msg.src === 'worker' && msg.event && msg.event === 'death') {
        if (!deathRow[msg.id]) {
          console.log(`Added worker with id: ${msg.id} to death row`);
          deathRow[msg.id] = 'waiting';
          console.log(`Forking new worker`);
          const worker = cluster.fork();
          forked.mark();
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
            console.log(`disconnecting and SIGTERM'ing worker: ${worker.id}`);
            killed.mark();
            worker.disconnect();
            worker.send('shutdown');
            setTimeout(() => {
              console.log(`killing worker with id: ${worker.id}`);
              worker.kill('SIGKILL');
            }, 10000);
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

    stoppable = fn().then(stop => stoppable = stop);
  }
};
