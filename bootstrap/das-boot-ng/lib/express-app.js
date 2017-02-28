const cookieParser = require('cookie-parser'),
  specs = require('./petri-specs');

module.exports = (app, config) => {
  let counter = 0;

  app.use(cookieParser());

  app.get('/api/aspects', (req, res) => {
    res.json(req.aspects);
  });
  
  app.get('/api/req', (req, res) => {
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
  
  app.get('/api/hello', (req, res) => {
    setTimeout(() => res.send('hi'), 50);
  });

  app.get('/api/bi/event', (req, res, next) => {
    const bi = config.bi(req.aspects);
    bi.log({evid: 300})
      .then(() => res.send(req.aspects))
      .catch(next);
  });

  app.get('/api/rpc/site/:id', (req, res, next) => {
    config.rpc.metasite(req.aspects).getMetasite(req.params.id)
      .then(response => res.send(response))
      .catch(next);
  });
  
  app.get('/api/petri/conduct-via-spec', (req, res, next) => {
    config.petri(req.aspects)
      .conductExperiment(specs.keys.spec1, 'fallback')
      .then(resp => res.send(resp))
      .catch(next);    
  });

  app.get('/api/petri/:spec/:fallback', (req, res, next) => {
    config.petri(req.aspects)
      .conductExperiment(req.params.spec, req.params.fallback)
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/api/gatekeeper/:metasite/:scope/:action', (req, res, next) => {
    config.gatekeeper(req.aspects)
      .authorize(req.params.metasite, {scope: req.params.scope, action: req.params.action})
      .then(() => res.status(201).end())
      .catch(next);
  });

  app.get('/api/maybe', (req, res) => {
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

  return app;
};
