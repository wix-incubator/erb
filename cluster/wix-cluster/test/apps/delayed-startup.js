require('../support/test-stats-app')();
require('../..').run(() => {
  return Promise.resolve()
    .then(delay)
    .then(require('./index'));
}, {metrics: {app_host: 'local', app_name: 'app'}});

function delay() {
  return new Promise(resolve => setTimeout(resolve, 1000));
}
