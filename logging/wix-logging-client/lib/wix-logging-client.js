'use strict';
const exchange = require('wix-cluster-exchange'),
  client = exchange.client('wix-logging');

const metadataEnrichmentHooks = [];

exports.write = write;
exports.registerMetadataEnrichmentHook = registerMetadataEnrichmentHook;

function write(event) {
  let toPubish = event;
  if (toPubish.error) {
    toPubish.error = coerce(toPubish.error);
  }
  client.send(enrich(toPubish));
}

function enrich(event) {
  let enriched = event;
  metadataEnrichmentHooks.forEach(hook => {
    enriched = hook(enriched);
  });

  return enriched;
}

function registerMetadataEnrichmentHook(hook) {
  metadataEnrichmentHooks.push(hook);
}

function coerce(error) {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack
  };
}