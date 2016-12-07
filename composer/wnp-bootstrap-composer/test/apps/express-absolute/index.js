const join = require('path').join, 
  Composer = require('../../..').Composer;

new Composer()
  .express(join(__dirname, './test/apps/express/express-app'))
  .start();
