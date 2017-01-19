require('../support/test-stats-app')();
require('../..').run(() => {
  return Promise.resolve()
    .then(delay)
    .then(require('./index'));
});

function delay() {
  return new Promise(resolve => setTimeout(resolve, 1000));
}