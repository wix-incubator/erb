const Composer = require('../../..').Composer;

new Composer({
  runner: () => customRunner
}).start();

function customRunner(thenable) {
  return thenable().then(() => console.log('Custom runner booted an app'));
}