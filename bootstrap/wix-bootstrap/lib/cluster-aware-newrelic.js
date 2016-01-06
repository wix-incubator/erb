'use strict';
if (!require('cluster').isMaster) {
  require('newrelic');
}