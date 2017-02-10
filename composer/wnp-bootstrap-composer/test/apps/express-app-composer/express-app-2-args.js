module.exports = (app, context) => {
  return app
    .get('/composer-2-args', (req, res) => res.send(context.app.name));
};
