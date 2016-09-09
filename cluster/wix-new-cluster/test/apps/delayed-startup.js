'use strict';
require('../support/test-stats-app')();
require('../..').run(() => new Promise(resolve => {
  setTimeout(() => require('./index')().then(resolve), 1000);
}));

