'use strict';
module.exports = function(settings) {
  return new ClusterRespawner(settings);
};

/**
 * Respawns dying processes.
 *
 * Detects cyclic death and just stops respawning process, say if it died n times in n seconds.
 *
 * @param settings  ex. { count: 10, inSeconds: 10 }
 * @constructor
 */
function ClusterRespawner(settings) {
  var handler = new RespawnHandler(settings || { count: 10, inSeconds: 10 });

  this.onMaster = function(cluster, next) {
    cluster.on('disconnect', function() {
      handler.around(cluster.fork);
    });
    next();
  };

}

function RespawnHandler(settings) {
  var stopCount = settings.count;
  var stopDuration = settings.inSeconds * 1000;

  var deathCount = 0;
  var deathTime = Date.now();

  this.around = function(fork) {
    updateCounters();

    if (shouldSpawn()) {
      console.log('Spawning new worker. die count: %s, interval: %s', deathCount, Date.now() - deathTime);
      fork();
    } else {
      console.log('Detected cyclic death not spawning new worker, die count: %s, interval: %s', deathCount, Date.now() - deathTime);
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

