'use strict';
require('../support/test-stats-app')();
require('../..').run(appFn, {fallback: fallbackApp});

function fallbackApp(e) {
  console.log('fallback app booted');
  console.log('fallback got error:', e)
}

function appFn() {
  return Promise.reject(new Error('sync error'));
}