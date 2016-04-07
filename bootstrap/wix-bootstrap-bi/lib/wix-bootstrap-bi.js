'use strict';
const biClient = require('wix-bi-logger-client'),
  biSupport = require('wnp-bi-node-support'),
  assert = require('assert'),
  resolveFilePrefix = require('./file-prefix-resolver'),
  cluster = require('cluster');

const logFilePrefix = resolveFilePrefix(cluster);
const factories = {};

module.exports = bootstrapContext => {
  assert(bootstrapContext, 'context is mandatory');
  assert(bootstrapContext.env, 'context.env is mandatory');
  assert(bootstrapContext.app, 'context.app is mandatory');

  const logDir = orThrow(bootstrapContext.env.logDir, 'context.env.logDir is not defined.');
  const artifactName = orThrow(bootstrapContext.app.artifactName, 'context.app.artifactName is not defined.');
  return addOrGetFactory(factories, logDir, artifactName);
};

function orThrow(value, message) {
  assert(value, message);
  return value;
}

function addOrGetFactory(factories, logDir, artifactName) {
  const key = logDir + '_' + logFilePrefix;
  if (!factories[key]) {

    factories[key] = biSupport.addTo(biClient.factory(), {
      artifactName: artifactName,
      logDir: logDir,
      filePrefix: logFilePrefix
    });
  }

  return factories[key];
}