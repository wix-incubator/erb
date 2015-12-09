'use strict';
const fs = require('fs'),
  join = require('path').join;

const config = JSON.parse(fs.readFileSync(join(process.env.APP_CONF_DIR, 'das-boot.json')));

module.exports = config;