'use strict';
const testkit = require('../');

describe('adapter', function() {
  this.timeout(30000);

  let event = {level: 'info', msg: 'log message is'};
  let apps = [
    {app: './test/apps/worker-setup.js', type: 'worker setup'},
    {app: './test/apps/worker-action.js', type: 'worker action'},
    {app: './test/apps/master-setup.js', type: 'master setup'},
    {app: './test/apps/master-action.js', type: 'master action'},
    {app: './test/apps/express-setup.js', type: 'express setup'},
    {app: './test/apps/express-action.js', type: 'express action'}];

  apps.forEach(item => {
    it(`should log and event within ${item.type}`,done => {
      testkit.run(item.app, event, done);
    });
  });
});