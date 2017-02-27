const urlResolve = require('url').resolve,
  _ = require('lodash');

module.exports = class SpecsFeeder {
  
  constructor(rpcFactory, petriUrl) {
    this._petriUrl = petriUrl;
    this._client = rpcFactory
      .clientFactory(urlResolve(this._petriUrl, '/petriContext'))
      .client({})
  }
  
  send(specs) {
    return this._client
      .invoke('addSpecs', toExperimentSpec(specs))
      .then(() => Object.keys(specs));
  }
};

function toExperimentSpec(specs) {
  const now = new Date();
  return _.toPairs(specs).map(([key, spec]) => {
    return {
      key,
      owner: spec.owner,
      creationDate: now,
      updateDate: now,
      persistent: spec.persistent || true,
      allowedForBots: spec.allowedForBots || false,
      scopes: [ {
        name: spec.scope,
        onlyForLoggedInUsers: spec.onlyForLoggedInUsers
      }],
      testGroups: spec.testGroups || []
    }
  });
}
