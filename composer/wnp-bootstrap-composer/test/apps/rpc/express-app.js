module.exports = (app, context) => {
  return app.get('/rpc/caller-id', (req, res, next) => {
    context.rpc
      .clientFactory(`http://localhost:${process.env.RPC_SERVER_PORT}`, 'TestService')
      .client(req.aspects)
      .invoke('testMethod')
      .then(resp => res.json(resp))
      .catch(next);
  })
    .get('/rpc/timeout', (req, res, next) => {
      context.rpc
        .clientFactory(`http://localhost:${process.env.RPC_SERVER_PORT}`, 'NonExistent')
        .client(req.aspects)
        .invoke('duration')
        .then(resp => res.json(resp))
        .catch(next);
    });
};
