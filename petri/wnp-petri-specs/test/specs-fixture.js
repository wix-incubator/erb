const spec1 = {
  spec1: {
    scope: 'myScope',
    owner: 'shahart@wix.com',
    onlyForLoggedInUsers: true,
  }
};

const spec2 = {
  spec2: {
    scope: 'myOtherScope',
    owner: 'shahart@wix.com',
    onlyForLoggedInUsers: false,
    persistent: false,
    allowedForBots: false,
    testGroups: ['true', 'false']
  }
};

module.exports = {
  spec1,
  spec2,
  all: Object.assign({}, spec1, spec2)
};
