'use strict';
const parentPid = process.env.PARENT_PID;
const watchedPid = process.env.WATCHED_PID;
const checkInterval = 1000;

if (isRunning(parentPid) === false) {
  throw new Error(`parent process with PID ${parentPid} not found`);
}

if (isRunning(watchedPid) === false) {
  throw new Error(`watched process with PID ${watchedPid} not found`);
}

setInterval(() => {
  console.log(`checkig parent, child: ${parentPid} ${watchedPid}`);
  if (isRunning(parentPid) === false) {
    console.log(`Parent process with pid: '${parentPid}' terminated, killing watched process with pid: ${watchedPid}, killing child and suiciding`);
    terminate(watchedPid);
    process.exit();
  }

  if (isRunning(watchedPid) === false) {
    console.log(`Watched process with pid: '${watchedPid}' terminated, suiciding`);
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
    process.kill(pid, 'SIGTERM');
  } catch(e) {
  }
}
