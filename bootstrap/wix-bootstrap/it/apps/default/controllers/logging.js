'use strict';
const log = require('log4js').getLogger('app');

module.exports.addTo = app => {

  app.get('/log-info', (req, res) => {
    log.info('from request');
    res.end();
  });
};