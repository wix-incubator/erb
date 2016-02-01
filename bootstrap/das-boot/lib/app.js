'use strict';
const metasiteRpcClient = require('./metasite-rpc-client');

module.exports = app => {

  app.get('/site/:id', (req, res, next) => {
    metasiteRpcClient.getMetasite(req.params.id)
      .then(response => res.send(response))
      .catch(next);
  });
};