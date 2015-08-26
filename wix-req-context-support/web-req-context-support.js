var _ = require('lodash');
var reqContext = require('wix-req-context');

module.exports = function () {
  return {
    addSupportToRpcClients: addSupportToRpcClients
  }

};

var addSupportToRpcClients = function (rpcFactories) {
  _.forEach(arguments, function (rpcFactory) {    
    rpcFactory.registerHeaderBuildingHook(function (headers, jsonBuffer) {
      // TODO headers are not mandatory
      headers['X-Wix-Request-Id'] = reqContext.reqContext().requestId;
      headers['X-WIX-URL'] = reqContext.reqContext().localUrl;
      headers['X-WIX-IP'] = reqContext.reqContext().userIp;
      headers['X-WIX-DEFAULT_PORT'] = reqContext.reqContext().userPort;
      headers['user-agent'] = reqContext.reqContext().userAgent;

      if(reqContext.reqContext().geoData){
        headers['GEOIP_COUNTRY_CODE'] = reqContext.reqContext().geoData.countryCode;
        headers['X-Wix-Country-Code'] = reqContext.reqContext().geoData.geoHeader;
        headers['country-code-override'] = reqContext.reqContext().geoData.countryCodeOverride;
      }

    });
  });
};