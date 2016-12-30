module.exports = (app, context) => {
  return app
    .get('/management-2-args', (req, res) => res.send('ok'))
    .get('/composer-2-args-env', (req, res) => res.json(context.env));
};
