'use strict';
const biClient = require('wix-bi-logger-client'),
  biSupport = require('wnp-bi-node-support'),
  resolveFilePrefix = require('./file-prefix-resolver'),
  cluster = require('cluster');

module.exports = context => {
  return biSupport.addTo(biClient.factory(), {
    artifactName: context.app.name,
    logDir: context.env.logDir,
    filePrefix: resolveFilePrefix(cluster)
  });
};