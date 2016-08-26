'use strict';
const isRunning = require('is-running');

const parentPid = process.env.PARENT_PID;
const watchedPid = process.env.WATCHED_PID;

if (isRunning(parentPid) === false) {
  throw new Error(`parent process with PID ${parentPid} not found`);
}

if (isRunning(watchedPid) === false) {
  throw new Error(`watched process with PID ${watchedPid} not found`);
}
