module.exports = (app, config) => {
  return app.get('/bi/:id', (req, res, next) => {
    config.biLogger({}).log({evtId: req.params.id})
      .then(() => res.end())
      .catch(next);
  });
};
