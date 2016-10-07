'use strict';
const spawn = require('child_process').spawn,
  join = require('path').join;

module.exports = opts => {
  return new Promise(resolve => {
    const options = opts || {};

    const child = spawn('node', [join(__dirname, './watchman.js')], {
      env: Object.assign({}, process.env, {
        PARENT_PID: options.parentPid,
        WATCHED_PID: options.watchedPid,
        CHECK_INTERVAL: options.checkInterval
      }),
      detached: true,
      stdio: 'ignore'
      // stdio: 'inherit'
    });
    child.unref();

    //TODO: I need it to be detached, so have to do timeout
    //maybe it is possible to do smth like pid check with retry or smth
    setTimeout(() => resolve(child.pid), 500);
  });
};
