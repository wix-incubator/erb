'use strict';
module.exports.get = callerIdInfo => headers => {
  if (callerIdInfo) {
    const host = callerIdInfo.host
      .replace('.wixpress.com', '')
      .replace('.wix.com', '');

    headers['X-Wix-RPC-Caller-ID'] = `${callerIdInfo.artifactId}@${host}`;
  }
};