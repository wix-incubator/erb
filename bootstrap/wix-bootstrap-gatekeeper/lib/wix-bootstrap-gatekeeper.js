const gkClient = require('wix-gatekeeper-client');

module.exports = (rpcFactory, url) => gkClient.factory(rpcFactory, url);
