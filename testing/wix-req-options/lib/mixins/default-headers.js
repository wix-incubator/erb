const chance = require('chance')();

module.exports.addTo = function (to) {
  to.withDefaultHeaders = function () {
    to.headers['x-wix-request-id'] = chance.guid();
    to.headers['x-wix-default_port'] = '2222';
    to.headers['x-wix-ip'] = '1.1.1.1';
    to.headers['x-wix-forwarded-url'] = 'http://www.kfir.com';
    to.headers['x-wix-language'] = 'pt';
    to.headers['x-wix-country-code'] = 'BR';

    //TODO: add outputs/variations, more intelligent header set-up
  }
};
