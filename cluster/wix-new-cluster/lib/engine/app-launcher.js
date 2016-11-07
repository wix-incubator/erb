const messages = require('../messages');

module.exports = (appFunction, currentProcess, currentWorker) => {
  return Promise.resolve()
    .then(appFunction)
    .then(stop => {
      currentProcess.send(messages.workerStarted(currentWorker.id));
      return stop;
    })
    .catch(e => {
      currentProcess.send(messages.workerFailed(currentWorker.id, e));

      //TOOD: test
      process.nextTick(() => currentProcess.exit(-1));
      //TODO: test
      return Promise.reject(e);
    });
};