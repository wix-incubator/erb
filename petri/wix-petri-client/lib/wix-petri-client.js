const assert = require('assert');

class WixPetriClient {
  constructor(rpcClient) {
    this.rpcClient = rpcClient;
  }

  conductExperiment(key, fallbackValue) {
    assert(key, 'experiment \'key\' is mandatory');
    assert(typeof key === 'string', 'experiment \'key\' must be string');
    if (fallbackValue !== undefined) {
      assert(typeof fallbackValue === 'string', 'experiment \'fallbackValue\' must be string');
    }

    return this.rpcClient.invoke('conductExperiment', key, fallbackValue);
  }

  conductAllInScope(scope) {
    assert(scope, 'experiment \'scope\' is mandatory');
    assert(typeof scope === 'string', 'experiment \'scope\' must be string');

    return this.rpcClient.invoke('conductAllInScope', scope);
  }
}

module.exports = WixPetriClient;
