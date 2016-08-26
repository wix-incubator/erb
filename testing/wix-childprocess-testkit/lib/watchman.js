'use strict';
const parentPid = process.env.PARENT_PID;
const watchedPid = process.env.WATCHED_PID;
const checkInterval = process.env.CHECK_INTERVAL || 10000;

if (isRunning(parentPid) === false) {
  throw new Error(`parent process with PID ${parentPid} not found`);
}

if (isRunning(watchedPid) === false) {
  throw new Error(`watched process with PID ${watchedPid} not found`);
}

console.log(`watcher started with parentPid: ${parentPid} and watchedPid: ${watchedPid}`);

setInterval(() => {
  if (isRunning(parentPid) === false) {
    terminate(watchedPid);
    process.exit();
  }

  if (isRunning(watchedPid) === false) {
    process.exit();
  }
}, checkInterval);

function isRunning(pid) {
  try {
    process.kill(pid,0);
    return true;
  }
  catch (e) {
    return false;
  }
}

function terminate(pid) {
  try {
    process.kill(pid);
  } catch(e) {
  }
}
