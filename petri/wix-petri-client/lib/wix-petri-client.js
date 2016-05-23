'use strict';

class WixPetriClient {
  constructor(rpcClient) {
    this.rpcClient = rpcClient;
  }

  conductExperiment(key, fallbackValue) {
    return this.rpcClient.invoke('conductExperiment', key, fallbackValue);
  }

  conductAllInScope(scope) {
    return this.rpcClient.invoke('conductAllInScope', scope);
  }
}

module.exports = WixPetriClient;