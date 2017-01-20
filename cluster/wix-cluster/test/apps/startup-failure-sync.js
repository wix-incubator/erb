require('../support/test-stats-app')();
require('../..').run(appFn, {fallback: fallbackApp, metrics: {app_host: 'local', app_name: 'app'}});

function fallbackApp(e) {
  console.log('fallback app booted');
  console.log('fallback got error:', e)
}

function appFn() {
  throw new Error('sync error');
}
