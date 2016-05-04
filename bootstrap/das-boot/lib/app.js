'use strict';
const metasiteRpcClient = require('./metasite-rpc-client'),
  bootstrapBi = require('wix-bootstrap-bi').di.value({
    env: {
      logDir: process.env.APP_LOG_DIR
    },
    app: {
      name: 'das-boot'
    }
  });
bootstrapBi.setDefaults({'src': 11});

module.exports = app => {
  app.get('/hello', (req, res) => {
    setTimeout(() => res.send('hi'), 50);
  });

  app.get('/die', () => {
    process.nextTick(() => {
      throw new Error('woop');
    });
  });

  app.get('/bi/event', (req, res, next) => {
    const bi = bootstrapBi.logger(req.aspects);
    bi.log({evid: 300})
      .then(() => res.send(req.aspects))
      .catch(next);
  });

  app.get('/site/:id', (req, res, next) => {
    metasiteRpcClient.getMetasite(req.aspects, req.params.id)
      .then(response => res.send(response))
      .catch(next);
  });
};