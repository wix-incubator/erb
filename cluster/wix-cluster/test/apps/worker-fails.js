'use strict';
const wixCluster = require('../..'),
  rp = require('request-promise');

wixCluster.run(() => { require('does-not-exist') }, {workerCount: 1})
  .catch(err => rp({method: 'POST', uri: 'http://localhost:3004', json: true, body: {evt: 'failed', err: err}}));
