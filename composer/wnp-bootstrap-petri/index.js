const loadConfiguration = require('./lib/load-configuration'),
  wixPetriClient = require('wix-petri-client');

module.exports = ({env, config, log, rpcFactory}) => {
  const laboratoryUrl = loadConfiguration({env, config, log});
  return wixPetriClient.factory(rpcFactory, laboratoryUrl);
};
