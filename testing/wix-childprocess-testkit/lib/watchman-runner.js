'use strict';
const spawn = require('child_process').spawn;

module.exports = opts => {
  return new Promise((resolve, reject) => {
    let output = '';
    const options = opts || {};
    const maybeResolve = out => (out.indexOf('watcher started') > -1) && resolve(child.pid);
    const logAndReject = err => {console.log(output); reject({pid: child.pid, error: err})};
    const logAndAppend = buf => {console.log(buf.toString()); output += buf.toString(); return output;};

    const child = spawn('node', ['./lib/watchman.js'], {
      env: Object.assign({}, process.env, {
        PARENT_PID: options.parentPid,
        WATCHED_PID: options.watchedPid,
        CHECK_INTERVAL: options.checkInterval
      }),
      detached: true
    });
    child.unref();

    child.stdout.on('data', data => maybeResolve(logAndAppend(data)));
    child.stderr.on('data', data => logAndAppend(data));
    child.on('exit', code => logAndReject(Error('child exited with code ' + code)));
    child.on('error', err => logAndReject(err));
  });
};

