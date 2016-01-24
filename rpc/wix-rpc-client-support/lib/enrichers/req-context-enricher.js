'use strict';

module.exports.get = wixReqContext => {
  return (headers) => {
    const reqContext = wixReqContext.get();
    headers['X-Wix-Request-Id'] = reqContext.requestId;
    headers['X-WIX-DEFAULT_PORT'] = reqContext.userPort;
    headers['user-agent'] = reqContext.userAgent;
    headers['X-WIX-IP'] = reqContext.userIp;
    headers['X-WIX-URL'] = reqContext.url;
    headers['X-Wix-Language'] = reqContext.language;
    headers['X-Wix-Language'] = reqContext.language;
    if(reqContext.geo){
      headers['X-Wix-Country-Code'] = reqContext.geo['2lettersCountryCode'];
    }

    return headers;
  };
};