const express = require('express'),
  cookieParser = require('cookie-parser');

module.exports = (app, config) => {
  const internalApp = new express.Router();
  let counter = 0;

  app.use(cookieParser());

  internalApp.get('/aspects', (req, res) => {
    res.json(req.aspects);
  });
  
  internalApp.get('/req', (req, res) => {
    res.json({
      cookies: req.cookies,
      params: req.params,
      query: req.query,
      baseUrl: req.baseUrl,
      hostname: req.hostname,
      ip: req.ip,
      path: req.path,
      protocol: req.protocol,
      headers: req.headers
    });
  });
  
  internalApp.get('/hello', (req, res) => {
    setTimeout(() => res.send('hi'), 50);
  });

  internalApp.get('/error-async', () => process.nextTick(() => {
    throw new AsyncError('async error');
  }));
  internalApp.get('/error-sync', () => {
    throw new SyncError('sync error');
  });
  
  internalApp.get('/error-next', (req, res, next) => {
    next(new NextError('next error'))
  });
  internalApp.get('/timeout', () => {
  });

  internalApp.get('/bi/event', (req, res, next) => {
    const bi = config.bi(req.aspects);
    bi.log({evid: 300})
      .then(() => res.send(req.aspects))
      .catch(next);
  });

  internalApp.get('/rpc/site/:id', (req, res, next) => {
    config.rpc.metasite(req.aspects).getMetasite(req.params.id)
      .then(response => res.send(response))
      .catch(next);
  });

  internalApp.get('/petri/:spec/:fallback', (req, res, next) => {
    config.petri(req.aspects)
      .conductExperiment(req.params.spec, req.params.fallback)
      .then(resp => res.send(resp))
      .catch(next);
  });

  internalApp.get('/gatekeeper/:metasite/:scope/:action', (req, res, next) => {
    config.gatekeeper(req.aspects)
      .authorize(req.params.metasite, {scope: req.params.scope, action: req.params.action})
      .then(() => res.status(201).end())
      .catch(next);
  });

  internalApp.get('/maybe', (req, res) => {
    counter++;
    let die = req.query.every || 100;
    let timeout = req.query.timeout || 10;

    if (counter !== undefined && counter >= die) {
      counter = undefined;
      setTimeout(() => {
        res.status(req.query.status || 500).send('ok');
        throw new Error('die my darling');
      }, timeout);
    } else {
      setTimeout(() => res.send('ok'), timeout);
    }
  });

  return app.use('/api', internalApp);
};

class AsyncError extends Error {
  constructor(msg) {
    super(msg);
  }
}

class SyncError extends Error {
  constructor(msg) {
    super(msg);
  }
}

class NextError extends Error {
  constructor(msg) {
    super(msg);
  }
}
