'use strict';
const wixCluster = require('../..'),
  rp = require('request-promise');

wixCluster.run(require('./index'), {workerCount: 1})
  .then(() => rp({method: 'POST', uri: 'http://localhost:3004', json: true, body: {evt: 'started'}}))
  .catch(err => rp({method: 'POST', uri: 'http://localhost:3004', json: true, body: {evt: 'failed', err: err}}));
