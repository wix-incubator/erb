const appInfoApp = require('../..'),
  express = require('express');

module.exports = () => {
  express()
    .use(appInfoApp({appVersion: '1.2.3', appName: 'an.app', profilingResourcesDir: process.env.PROFILING_RESOURCES_DIR }))
    .listen(process.env.PORT);
};
