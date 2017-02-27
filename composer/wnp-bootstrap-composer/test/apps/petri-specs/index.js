const Composer = require('../../..').Composer;

new Composer()
  .express('./test/apps/petri-specs/app')
  .start();
