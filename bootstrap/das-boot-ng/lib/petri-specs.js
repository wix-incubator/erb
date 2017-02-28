const specs = {
  spec1: {
    scope: 'myScope',
    owner: 'shahart@wix.com',
    onlyForLoggedInUsers: true,
  },
  spec2: {
    scope: 'myOtherScope',
    owner: 'shahart@wix.com',
    onlyForLoggedInUsers: false,
    persistent: false,
    allowedForBots: false,
    testGroups: ['group1', 'group2']
  }
};

module.exports.all = Object.assign({}, specs);
module.exports.keys = Object.keys(module.exports.all).reduce((acc, key) => { acc[key] = key; return acc }, {});
