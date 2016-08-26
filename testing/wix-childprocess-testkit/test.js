'use strict';
const cp = require('child_process');

const child = cp.spawn('bash',['-c', 'echo started && read']);

setTimeout(() => {
  console.log(child.pid);
  console.log('is alive', process.kill(child.pid, 0));
  console.log(process.kill(child.pid, 'SIGKILL'));
  setTimeout(() => {
    console.log(cp.execSync('ps').toString());
    console.log('is alive', process.kill(child.pid, 0));
  }, 1000);
}, 500);

