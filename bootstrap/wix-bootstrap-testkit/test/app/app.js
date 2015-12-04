'use strict';

module.exports = app => {
  app.get('/', (req, res) => res.end());
  return app;
};