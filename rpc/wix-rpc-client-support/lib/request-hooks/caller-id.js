module.exports.get = callerIdInfo => headers => {
  if (callerIdInfo) {
    const {namespace, name, host} = callerIdInfo;
    const serverName = host
      .replace('.wixpress.com', '')
      .replace('.wix.com', '')
      .replace('.wixprod.net', '');

    headers['X-Wix-RPC-Caller-ID'] = `${name}:${namespace}@${serverName}`;
  }
};
