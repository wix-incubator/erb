module.exports = (app, context) => {
  const config = context.config.json('app');
  const metasiteRpcClientFactory = context.rpc.clientFactory(config.services.metasite, 'ReadOnlyMetaSiteManager');

  app.get('/sites/:siteId', (req, res, next) => {
    metasiteRpcClientFactory.client(req.aspects)
      .invoke('listSites', req.params.siteId)
      .then(rpcResponse => res.json(rpcResponse))
      .catch(next);
  });
  return app;
};
