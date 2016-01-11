'use strict';

module.exports.addTo = app => {
  app.all('/health/is_alive', (req, res) => res.send('Alive'));
};