exports.resolve = (headers, remoteAddress) => headers['x-wix-ip'] || remoteAddress;
