'use strict';
const runner = require('../..');

runner({})(() => console.log(`pid: ${process.pid}`));

