'use strict';
const reqContextInjector = require('./req-context-injector');

exports.addTo = loggingClient => {
  loggingClient.registerMetadataEnrichmentHook(metadataInjector);
};

function metadataInjector(event) {
  return reqContextInjector(event);
}