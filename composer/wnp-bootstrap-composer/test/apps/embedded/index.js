'use strict';
module.exports = () => {
  const Composer = require('../../..').Composer;
  return new Composer()
    .express('./test/apps/express/express-app');
};