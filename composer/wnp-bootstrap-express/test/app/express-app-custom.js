module.exports = (app, context) => {

  return app
    .get('/custom/env', (req, res) => res.json(context.env))    
    .get('/custom/errors/async', req =>
      process.nextTick(() => {
        throw new Error(req.query.m);
      })
    )
    .get('/custom/errors/sync', req => {
      throw new Error(req.query.m);
    })
    .get('/custom/errors/timeout', (req, res) => {
      setTimeout(() => res.end(), req.query.ms);
    })
    .use((err, req, res, next) => {
      if (err._timeout && err._timeout === true) {
        res.status(504).send({name: 'x-timeout', message: 'custom-timeout'});
      } else {
        res.status(500).send({name: err.name, message: 'custom-' + err.message});
      }
      next(err);
    });
};
