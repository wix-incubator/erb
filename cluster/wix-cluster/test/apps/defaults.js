require('../support/test-stats-app')();
require('../..').run(require('./index'), {metrics: {app_host: 'local', app_name: 'my-app'}}).then(() => console.log('callback after startup'));
