'use strict';
const testkit = require('../..'),
  env = require('env-support').basic({
    PORT: process.env.PORT
  });

testkit.fork('./test/apps/app-http', {env: env}, testkit.checks.httpGet('/test')).start();
