'use strict';

module.exports.get = callerIdInfo => {

  return headers => {
    if(callerIdInfo){
      headers['X-Wix-RPC-Caller-ID'] = `${callerIdInfo.artifactId}@${cleanHost(callerIdInfo.host)}`;
    }
  };
};

function cleanHost(host){
  return host.replace('.wixpress.com', '')
             .replace('.wix.com', '');
}