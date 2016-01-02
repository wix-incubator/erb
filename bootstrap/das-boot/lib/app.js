'use strict';
const metasiteRpcClient = require('./metasite-rpc-client');

module.exports = (app, cb) => {

  app.get('/site/:id', (req, res) => {
    metasiteRpcClient.getMetasite(req.params.id)
      .then(response => res.send(response))
      .catch(err => {
        console.log(err);
        res.status(500).send(err);
      });
  });

  cb();
};