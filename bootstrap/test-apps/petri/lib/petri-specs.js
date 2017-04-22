// define your specifications
const specs = {
  'MySpecForExperiment1': {
    scope: 'my-service-scope',
    owner: 'thatsme@wix.com',
    onlyForLoggedInUsers: true,
  },
  'MySpecForExperiment2': {
    scope: 'my-service-scope',
    owner: 'thatsme@wix.com',
    onlyForLoggedInUsers: false,
    persistent: false,
    allowedForBots: false,
    testGroups: ['kill', 'kill-not']
  }
};

// helpers. see usage below
module.exports.all = Object.assign({}, specs);
module.exports.keys = Object.keys(module.exports.all).reduce((acc, key) => {
  acc[key] = key;
  return acc
}, {});
