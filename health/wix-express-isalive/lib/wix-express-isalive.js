'use strict';

module.exports.addTo = app => {
  app.all('/health/is_alive', (req, res) => {
    (req.method === 'HEAD') ? res.end() : res.send('Alive');

  });
};