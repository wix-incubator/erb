const Health = require('./health'),
  specs = require('./petri-specs');

module.exports = context => {
  const config = context.config.load('app');
  const metasiteRpcClientFactory = context.rpc.clientFactory(config.services.metasite, 'ReadOnlyMetaSiteManager');
  const biLogger = biLoggerFactory(context);
  const health = new Health();
  
  context.management.addHealthTest('aTest', () => health.fn());
  context.petri.addSpecs(specs.all);
  
  return {
    rpc: {
      metasite: aspects => metasiteRpcClient(metasiteRpcClientFactory)(aspects)
    },
    bi: aspects => biLogger.logger(aspects),
    petri: aspects => context.petri.client(aspects),
    gatekeeper: aspects => context.gatekeeper.client(aspects),
    health
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
