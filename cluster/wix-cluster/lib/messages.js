const origin = 'wix-cluster',
  coerce = require('./errors').coerce;

module.exports.isWixClusterMessageWithKey = (msg, key) => isWixClusterMessage(msg, key);
module.exports.aWixClusterMessageWithKey = (key, data) => aWixClusterMessage(key, data);

module.exports.isWorkerMemoryStatsMessage = msg => isWixClusterMessage(msg, 'worker-stats-memory');
module.exports.workerMemoryStatsMessage = data => aWixClusterMessage('worker-stats-memory', data);

module.exports.isWorkerEventLoopMessage = msg => isWixClusterMessage(msg, 'worker-stats-event-loop');
module.exports.workerEventLoopMessage = data => aWixClusterMessage('worker-stats-event-loop', data);

module.exports.isWorkerStarted = msg => isWixClusterMessage(msg, 'worker-started');
module.exports.workerStarted = workerId => aWixClusterMessage('worker-started', workerId);

module.exports.isWorkerFailed = msg => isWixClusterMessage(msg, 'worker-failed');
module.exports.workerFailed = (workerId, err) => aWixClusterMessage('worker-failed', {workerId, err: coerce(err)});

module.exports.isYouCanDieNow = msg => isWixClusterMessage(msg, 'you-can-die-now');
module.exports.youCanDieNow = () => aWixClusterMessage('you-can-die-now');

module.exports.isBroadcast = msg => isWixClusterMessage(msg, 'broadcast');
module.exports.broadcast = msg => aWixClusterMessage('broadcast', msg);

module.exports.workerCount = count => aWixClusterMessage('worker-count', count);
module.exports.workerDeathCount = count => aWixClusterMessage('death-count', count);


function aWixClusterMessage(key, value) {
  return {origin, key, value};
}

function isWixClusterMessage(msg, key) {
  return !!(msg && msg.origin && msg.origin === origin && msg.key && msg.key === key);
}
