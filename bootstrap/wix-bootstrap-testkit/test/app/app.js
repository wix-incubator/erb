'use strict';

module.exports = (app, cb) => {
  app.get('/', (req, res) => res.end());
  cb();
};