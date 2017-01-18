module.exports = (app, context) => {
  app.get('/', (req, res) => res.end())
    .get('/env', (req, res) => res.json(context.env))
    .get('/aspects/web-context', (req, res) => res.json(req.aspects['web-context']))
    .get('/aspects/petri', (req, res) => res.json(req.aspects['petri'].cookies))
    .get('/aspects/bi', (req, res) => res.json(req.aspects['bi']))
    .get('/aspects/wix-session', (req, res) => res.json(req.aspects['session']))
    .get('/newrelic', (req, res) => {
      res.json({
        reqTimingHeaders: req.app.locals.newrelic.getBrowserTimingHeader(),
        appTimingHeaders: app.locals.newrelic.getBrowserTimingHeader()
      });
    })
    .get('/errors/unhandled-rejection', (req, res) => {
      Promise.reject(Error('unhandled-rejection'));
      setTimeout(() => res.end(), 200);
    })
    .get('/errors/async', req =>
      process.nextTick(() => {
        throw new Error(req.query.m);
      })
    )
    .get('/errors/sync', req => {
      throw new Error(req.query.m);
    })
    .get('/errors/timeout', (req, res) => {
      setTimeout(() => res.end(), req.query.ms);
    })
    .get('/req/ip', (req, res) => {
      res.json({ip: req.ip});
    });

  // const router = new express.Router()
  //   .get('errors/async', req =>
  //     process.nextTick(() => {
  //       throw new Error(req.query.m);
  //     })
  //   )
  //   .get('errors/sync', req => {
  //     throw new Error(req.query.m);
  //   })
  //   .get('errors/timeout', (req, res) => {
  //     setTimeout(() => res.end(), req.query.ms);
  //   })
  //   .get('req/ip', (req, res) => {
  //     res.json({ip: req.ip});
  //   })
  //   .use((err, req, res, next) => {
  //     if (err._timeout && err._timeout === true) {
  //       res.status(504).send({name: 'x-timeout', message: 'custom-timeout'});
  //     } else {
  //       res.status(500).send({name: err.name, message: 'custom-' + err.message});
  //     }
  //     next(err);
  //   });

  // app.use('custom', router);

  return app;
};
