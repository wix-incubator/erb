'use strict';
const fs = require('fs');

const config = JSON.parse(fs.readFileSync(process.env.APP_CONF_DIR, 'das-boot.json'));

module.exports = config;