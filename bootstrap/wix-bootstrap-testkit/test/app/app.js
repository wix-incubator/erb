'use strict';

module.exports = (app, cb) => {
  app.get('/', (req, res) => res.end());
  app.get('/env', (req, res) => res.json(process.env));
  cb();
};