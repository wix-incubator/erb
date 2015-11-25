'use strict';

module.exports.addTo = app => {
  app.get('/health/is_alive', (req, res) => res.send('Alive'));
};