module.exports = (app, config) => {
  return app.get('/config', (req, res) => res.json(config));
};
