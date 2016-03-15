'use strict';
const metasiteRpcClient = require('./metasite-rpc-client');

module.exports = app => {

  app.get('/hello', (req, res) => {
    setTimeout(() => res.send('hi'), 50);
  });

  app.get('/die', () => {
    process.nextTick(() => {
      throw new Error('woop');
    });
  });


  app.get('/site/:id', (req, res, next) => {
    metasiteRpcClient.getMetasite(req.params.id)
      .then(response => res.send(response))
      .catch(next);
  });
};