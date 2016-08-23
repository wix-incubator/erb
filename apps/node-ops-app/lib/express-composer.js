'use strict';
const express = require('express');

module.exports = opts => (context, apps) => {
  const expressApp = express();

  expressApp.locals.newrelic = context.newrelic;
  //TODO: test this, as this is applicavle only for express.static
  expressApp.set('etag', false);
  expressApp.set('trust proxy', true);
  expressApp.get('/health/is_alive', (req, res) => res.send('Alive'));

  apps.forEach(app => {
    //TODO: validate that app is provided
    if (app.locals) {
      app.locals.newrelic = context.newrelic;
    }
    expressApp.use(app);
  });

  return expressApp;
};