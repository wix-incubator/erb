'use strict';
module.exports = context => {
  const config = context.config.load('das-boot');
  const metasiteRpcClientFactory = context.rpc.clientFactory(config.services.metasite, 'ReadOnlyMetaSiteManager');
  const biLogger = biLoggerFactory(context);

  return {
    rpc: {
      metasite: aspects => metasiteRpcClient(metasiteRpcClientFactory)(aspects)
    },
    biLogger: aspects => biLogger.logger(aspects)
  }
};

function biLoggerFactory(context) {
  const bi = context.bi;
  bi.setDefaults({'src': 11});
  return bi;
}

function metasiteRpcClient(metasiteRpcClientFactory) {
  return (aspects) => {
    const client = metasiteRpcClientFactory.client(aspects);
    return {
      getMetasite: id => client.invoke('getMetaSite', id)
    }
  }
}