module.exports = (app, context) => {
  return app
    .get('/', (req, res) => res.send(context.app))
    .get('/duration/:ms', (req, res) => {
      setTimeout(() => res.end(), req.params.ms);
    });
};
