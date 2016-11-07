const EventEmitter = require('events');

module.exports.process = aProcess;
module.exports.worker = aWorker;
module.exports.cluster = aCluster;

function aProcess() {
  const collectedMessages = [];
  const currentProcess = new EventEmitter();

  currentProcess.send = msg => currentProcess.emit('message', msg);
  currentProcess.on('message', msg => collectedMessages.push(msg));

  let exitCallback = () => {};
  currentProcess.onExit = cb => exitCallback = cb;
  currentProcess.exit = value => {
    currentProcess.exitCode = value;
    exitCallback(value);
  };

  return {currentProcess, collectedMessages};
}

function aWorker(ctx, id) {
  const collectedMessages = [];
  const worker = new EventEmitter();
  worker.id = id || 1;
  worker.disconnect = ctx.spy();
  worker.kill = ctx.spy();

  worker.send = msg => worker.emit('message', msg);
  worker.on('message', msg => collectedMessages.push(msg));

  return worker;
}

function aCluster(ctx, workers) {
  const workersObj = {};
  if (workers) {
    workers.forEach(worker => workersObj[worker.id] = worker);
  }

  const cluster = new EventEmitter();
  cluster.fork = ctx.spy();
  cluster.workers = workersObj;
  return cluster;
}