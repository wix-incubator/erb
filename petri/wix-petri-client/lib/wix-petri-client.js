const assert = require('assert');

class WixPetriClient {
  constructor(laboratoryRpcClient, log) {
    this.laboratoryRpcClient = laboratoryRpcClient;
    this.log = log;
  }
  
  conductExperiment(key, fallbackValue) {
    assert(key && typeof key === 'string', 'experiment \'key\' is mandatory and must be string');
    if (fallbackValue !== undefined) {
      assert(typeof fallbackValue === 'string', 'experiment \'fallbackValue\' must be string');
    } else {
      this.log.info('Calling \'conductExperiment\' without fallback value is deprecated.')
    }
    
    return this.laboratoryRpcClient
      .invoke('conductExperiment', key, fallbackValue)
      .catch(this._logAndFallback('provided fallback value', fallbackValue));
  }
  
  conductAllInScope(scope) {
    assert(scope && typeof scope === 'string', 'experiment \'scope\' is mandatory and must be string');

    return this.laboratoryRpcClient
      .invoke('conductAllInScope', scope)
      .catch(this._logAndFallback('empty experiments list', {}));
  }

  _logAndFallback(msg, fallback) {
    return err => {
      if (fallback !== undefined) {
        this.log.error('Failed to communicate with petri server, falling back to ' + msg + '.');
        return fallback;
      } else {
        return Promise.reject(err);
      }
    };
  }
}

module.exports = WixPetriClient;
