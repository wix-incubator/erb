const assert = require('assert'),
  _ = require('lodash');

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
  
  conductAllInScopes(...scopes) {
    assert(scopes.length > 0 && _.every(scopes, _.isString), 'experiment \'scopes\' is mandatory and must be varargs of strings');
    return this.laboratoryRpcClient
      .invoke('conductAllInScopes', scopes)
      .catch(this._logAndFallback('empty experiments list', {}));
  }
  
  conductAllInScope(scope) {
    return this.conductAllInScopes(scope);
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
