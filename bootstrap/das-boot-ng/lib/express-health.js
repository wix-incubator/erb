module.exports = (app, config) => {

  app.post('/api/health/alive', (req, res) => {
    config.health.setAlive();
    res.end();
  });

  app.post('/api/health/dead', (req, res) => {
    config.health.setDead();
    res.end();
  });

  return app;
};
