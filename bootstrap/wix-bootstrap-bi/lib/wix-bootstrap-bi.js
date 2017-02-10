const biClient = require('wix-bi-logger-client'),
  biSupport = require('wnp-bi-node-support'),
  resolveFilePrefix = require('./file-prefix-resolver'),
  cluster = require('cluster');

module.exports = (appName, logDir) => {
  return biSupport.addTo(biClient.factory(), {
    artifactName: appName,
    logDir: logDir,
    filePrefix: resolveFilePrefix(cluster)
  });
};
