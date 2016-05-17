'use strict';
// const cluster = require('cluster');

//TODO: add run mode as well, tests that use composer out of cluster fail
module.exports.get = () => {
  // if (!cluster.isMaster) {
  //   console.log('returning new relic');
  return require('newrelic');
  // } else {
  //   console.log('returning dummy new relic');
  //   return {};
  // }
};