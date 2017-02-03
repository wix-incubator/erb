const appInfoApp = require('../..'),
  express = require('express');

module.exports = () => {
  express()
    .use(appInfoApp({appVersion: '1.2.3', appName: 'an.app', heapDumpTempDir: process.env.HEAP_DUMP_DIR }))
    .listen(process.env.PORT);
};
