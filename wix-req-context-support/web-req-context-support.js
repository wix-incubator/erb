var _ = require('lodash');
var reqContext = require('wix-req-context');


exports.rpcSupport = function (rpcSigner) {
  return new RpcSupportService(rpcSigner);
};

function RpcSupportService(rpcSigner) {
  this.rpcSigner = rpcSigner;
}

RpcSupportService.prototype.addSupportToRpcClients = function (rpcFactories) {
  var self = this;
  _.forEach(arguments, function (rpcFactory) {
    rpcFactory.registerHeaderBuildingHook(function (headers, jsonBuffer) {
      // TODO headers are not mandatory
      headers['X-Wix-Request-Id'] = reqContext.reqContext().requestId;
      headers['X-WIX-URL'] = reqContext.reqContext().localUrl;
      headers['X-WIX-IP'] = reqContext.reqContext().userIp;
      headers['X-WIX-DEFAULT_PORT'] = reqContext.reqContext().userPort;
      headers['user-agent'] = reqContext.reqContext().userAgent;
      self.rpcSigner.sign(jsonBuffer, headers);

      if (reqContext.reqContext().geoData) {
        headers['GEOIP_COUNTRY_CODE'] = reqContext.reqContext().geoData.countryCode;
        headers['X-Wix-Country-Code'] = reqContext.reqContext().geoData.geoHeader;
        headers['country-code-override'] = reqContext.reqContext().geoData.countryCodeOverride;
      }
    });
  });
};
