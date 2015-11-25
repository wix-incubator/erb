'use strict';
const wixBootstrapCluster = require('wix-bootstrap-cluster');

wixBootstrapCluster.run(
  () => require('./app'),
  () => require('./config'));