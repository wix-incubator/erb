require('../support/test-stats-app')();
require('../..').run(require('./index')).then(() => console.log('callback after startup'));