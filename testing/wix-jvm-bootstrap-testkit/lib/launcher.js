'use strict';
const args = process.env.JVM_TESTKIT_CMD.split(' ');
const child = require('child_process').spawn(args[0], args.slice(1), {stdio: 'inherit'});

process.on('message', msg => {
  if (msg && msg.type && msg.type ==='jvm-testkit-kill-yourself') {
    console.log('Received kill req from wix-jvm-bootstrap-testkit, killing jvm process pid: ' + child.pid);
    child.kill();
  }
});

process.on('exit', () => {
  console.log('Forked process for wix-jvm-bootstrap-testkit exiting, killing jvm process pid: ' + child.pid);
  child.kill();
});

