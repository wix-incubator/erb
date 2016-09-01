'use strict';
require('../../lib/watchman-runner')({
  parentPid: process.pid, 
  watchedPid: process.env['WATCHED_PID']})
  .then(watcherPid => process.send('pid=' + watcherPid));
