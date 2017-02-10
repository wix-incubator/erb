module.exports = (app, context) => {
  return app
    .get('/management-2-args', (req, res) => res.send(context.app.name));
};
