const configName = require('./static-values').configName,
  envVariable = require('./static-values').envVariable;

module.exports = (context, isProduction) => {
  if (context.env[envVariable]) {
    return context.env[envVariable];
  } else if (isProduction) {
    return context.config.load(configName).services.gatekeeper;
  } else {
    // TODO: export default gatekeeper port from somewhere. Possibly gatekeeper client.
    return 'http://localhost:3029';
  }
};
