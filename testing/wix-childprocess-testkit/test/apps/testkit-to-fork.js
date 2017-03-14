const testkit = require('../..');

testkit.fork('./test/apps/app-http', {env: process.env}, testkit.checks.httpGet('/test')).start();
