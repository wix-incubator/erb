exports.resolve = (headers, remotePort) => headers['x-wix-default_port'] || remotePort;
