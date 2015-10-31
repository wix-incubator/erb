'use strict';
var domain = require('wix-domain');

/**
 * Immutable request context, can be written only once on new domain
 * @param reqContext - properties: requestId, userIp, userPort, userAgent, geoData, localUrl
 */
exports.setReqContext = function (reqContext) {
  if ((domain.wixDomain()) && (!domain.wixDomain().reqContext)) {
    Object.freeze(reqContext);
    domain.wixDomain().reqContext = reqContext;
  }

};

/**
 * return reqContext from the domain
 * @returns {*|reqContext}
 */
exports.reqContext = function () {
  if (domain.wixDomain() && domain.wixDomain().reqContext) {
    return domain.wixDomain().reqContext;
  }
};

