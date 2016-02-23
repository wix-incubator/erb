'use strict';

module.exports.addTo = app => {

  app.get('/static/hello', (req, res) => {
    res.send('world')
  });
};