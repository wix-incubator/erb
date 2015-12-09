'use strict';
module.exports = (app, cb) => {
  app.get('/site', (req, res) => res.end());
  cb();
};