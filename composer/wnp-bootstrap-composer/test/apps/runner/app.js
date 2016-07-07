const Composer = require('../../..').Composer;

module.exports = opts => new Composer({
  runner: () => customRunner
}).start(opts);

function customRunner(thenable) {
  return thenable().then(stop => {
    console.log('Custom runner booted an app');
    return stop;
  });
}