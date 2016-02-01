'use strict';

module.exports.setup = cluster => {
  if (!cluster.isMaster) {
    require('newrelic');
  }
};