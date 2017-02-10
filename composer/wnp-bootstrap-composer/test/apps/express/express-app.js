module.exports = (app, context) => {
  return app.use((req, res, next) => {
    res.on('x-before-flushing-headers', () => res.append('x-before-flushing-headers', 'triggered'));
    next();
  })
    .get('/', (req, res) => res.send(context.app))    
    .get('/req-context', (req, res) => res.json(req.aspects['web-context']))
    .get('/wix-session', (req, res) => res.json(req.aspects['session']))
    .get('/cache-control', (req, res) => res.end())
    .get('/custom', (req, res) => res.send('custom'))
    .get('/patch', (req, res) => res.end())
    .get('/newrelic', (req, res) => res.json({
      reqTimingHeaders: req.app.locals.newrelic.getBrowserTimingHeader(),
      appTimingHeaders: req.app.locals.newrelic.getBrowserTimingHeader()
    }));
};
