module.exports = {
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
    testGroups: ['true', 'false']
  }
};
