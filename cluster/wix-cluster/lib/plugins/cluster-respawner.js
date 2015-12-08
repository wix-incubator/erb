'use strict';
const exchange = require('wix-cluster-exchange'),
  log = require('wix-logger').get('wix-cluster');

module.exports = settings => new ClusterRespawner(settings);

/**
 * Respawns dying processes.
 *
 * Detects cyclic death and just stops respawning process, say if it died n times in n seconds.
 *
 * @param settings  ex. { count: 10, inSeconds: 10 }
 * @constructor
 */
function ClusterRespawner(settings) {
  const handler = new RespawnHandler(settings || {count: 10, inSeconds: 10});

  this.onMaster = (cluster, next) => {
    let shutdownExchange = exchange.server('cluster-shutdown');
    shutdownExchange.onMessage((message) => {
      if (message.type === 'worker-shutdown-gracefully') {
        let worker = cluster.workers[message.id];
        if (worker && !worker.respawned) {
          worker.respawned = true;
          handler.around(() => cluster.fork());
        }
      }
    });

    cluster.on('disconnect', worker => {
      if (worker && !worker.respawned) {
        worker.respawned = true;
        handler.around(() => cluster.fork());
      }
    });
    next();
  };

}

function RespawnHandler(settings) {
  const stopCount = settings.count;
  const stopDuration = settings.inSeconds * 1000;

  let deathCount = 0;
  let deathTime = Date.now();

  this.around = fork => {
    updateCounters();

    if (shouldSpawn()) {
      log.info('Spawning new worker. die count: %s, interval: %s', deathCount, Date.now() - deathTime);
      fork();
    } else {
      log.info('Detected cyclic death not spawning new worker, die count: %s, interval: %s', deathCount, Date.now() - deathTime);
    }
  };

  function updateCounters() {
    if ((Date.now() - deathTime) > stopDuration) {
      deathCount = 1;
      deathTime = Date.now();
    } else {
      deathCount = deathCount + 1;
    }
  }

  function shouldSpawn() {
    return ((deathCount <= stopCount) && ((Date.now() - deathTime) <= stopDuration));
  }
}

