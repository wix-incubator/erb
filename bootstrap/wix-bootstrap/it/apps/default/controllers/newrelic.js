'use strict';
module.exports.addTo = app => {
  app.get('/newrelic', (req, res) => {
    res.json({
      reqTimingHeaders: req.app.locals.newrelic.getBrowserTimingHeader(),
      appTimingHeaders: app.locals.newrelic.getBrowserTimingHeader()
    });
  });
};