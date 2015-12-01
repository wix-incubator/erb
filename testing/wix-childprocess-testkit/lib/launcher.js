'use strict';
const join = require('path').join;

require('..').client(process.env.APP_TO_LAUNCH_TIMEOUT);
require(join(process.cwd(), process.env.APP_TO_LAUNCH));