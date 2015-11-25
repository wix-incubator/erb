'use strict';
const wixBootstrapCluster = require('../../..');

wixBootstrapCluster.run(
  () => require('./app'),
  () => require('./config'));