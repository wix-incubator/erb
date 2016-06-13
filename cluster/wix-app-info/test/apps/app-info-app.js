const appInfoApp = require('../..'),
  express = require('express');

module.exports = () => {
  express()
    .use(appInfoApp({appVersion: '1.2.3', appName: 'an.app', heapDumpTempDir: './target/heap-dump-it'}))
    .listen(process.env.PORT);
};
