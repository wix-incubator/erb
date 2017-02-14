module.exports = (app, context) => {

  app.get('/required-login-with-forbid-resource', context.requireLogin.forbid, (req, res) => {
    res.sendStatus(200);
  });

  app.get('/required-login-with-redirect-resource', context.requireLogin.redirect, (req, res) => {
    res.sendStatus(200);
  });

  return app;
};
