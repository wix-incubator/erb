const runMode = require('wix-run-mode'),
  validator = require('wix-session-renewal'),
  log = require('wnp-debug')('wix-bootstrap-require-login');

module.exports = ({config, petri, rpc, session}) => {
  if (runMode.isProduction()) {
    registerTogglerSpec(petri);
    const remote = rpc.clientFactory(remoteUrl(config), 'RemoteRenewalSessionValidationService');
    return validator(remote, session, petriToggler(petri));
  } else {
    log.info('remote session validation disabled in non-production environment');
    return () => Promise.resolve();
  }
};

function registerTogglerSpec(petri) {
  petri.addSpecs({
    'wnp.security.ValidateSession': {
      scope: 'wnp',
      owner: 'daniels@wix.com',
      onlyForLoggedInUsers: true,
      testGroups: ['false', 'true']
    }
  });
}

function remoteUrl(config) {
  return config.load('wix-bootstrap-require-login').validationServerUrl;
}

function petriToggler(petri) {
  return req => petri
    .client(req.aspects)
    .conductExperiment('wnp.security.ValidateSession', 'false')
    .then(s => s === 'true');
}
