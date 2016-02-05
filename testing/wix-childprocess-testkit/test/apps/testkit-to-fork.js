'use strict';
const testkit = require('../..'),
  env = require('env-support').basic({
    PORT: process.env.PORT
  });

testkit.server(`./test/apps/app-http`, {env: env}, testkit.checks.httpGet('/test')).doStart();
