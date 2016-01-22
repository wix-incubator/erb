'use strict';
const moment = require('moment');

module.exports = version => (req, res) => {
  res.json({
    serverStartup: moment().utc().subtract(process.uptime(), 'seconds').format('DD/MM/YYYY HH:mm:ss.SSS'),
    version: version
  });
};