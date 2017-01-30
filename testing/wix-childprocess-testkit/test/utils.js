'use strict';
const eventually = require('wix-eventually'),
  expect = require('chai').expect,
  childProcess = require('child_process');

function expectProcessesToBeAlive() {
  return eventually(() => Promise.resolve().then(() => Array.from(arguments).forEach(pid => expect(isRunning(pid)).to.equal(true))));
}

function expectProcessesToNotBeAlive() {
  return eventually(() => Promise.resolve().then(() => Array.from(arguments).forEach(pid => expect(isRunning(pid)).to.not.equal(true))));
}

function isRunning(pid) {
  try {
    process.kill(pid,0);
    return true;
  }
  catch (e) {
    return false;
  }
}

function killProcess(pid) {
  return new Promise(resolve => {
    try {
      process.kill(pid, 'SIGKILL');
    } catch (e) {
    }
    resolve();
  });
}

function killProcesses() {
  return Promise.all(Array.from(arguments).map(pid => killProcess(pid)));
}


function launchProcess() {
  return new Promise((resolve, reject) => {
    let output = '';
    const child = childProcess.spawn('bash',['-c', 'echo started && read']);

    child.stdout.on('data', data => {
      console.log(data.toString());
      output += data.toString();
      if (output.indexOf('started') > -1) {
        resolve(child.pid);
      }
    });

    child.on('exit', code => reject(Error('child exited with code ' + code)));
    child.on('error', err => reject(err));
  });
}

function forkProcess(launcher, env) {
  return new Promise((resolve, reject) => {
    let output = '';
    const child = childProcess.fork(launcher, {env: Object.assign({}, process.env, env), silent: true});

    child.stdout.on('data', data => {
      console.log(data.toString());
      output += data.toString();
      if (output.indexOf('started') > -1) {
        resolve(child.pid);
      }
    });

    child.stderr.on('data', data => {
      console.log(data.toString());
      output += data.toString();
      if (output.indexOf('started') > -1) {
        resolve(child.pid);
      }
    });


    child.on('exit', code => reject(Error('child exited with code ' + code)));
    child.on('error', err => reject(err));
  });
}


module.exports.expectProcessesToBeAlive = expectProcessesToBeAlive;
module.exports.expectProcessesToNotBeAlive = expectProcessesToNotBeAlive;
module.exports.isRunning = isRunning;
module.exports.killProcess = killProcess;
module.exports.killProcesses = killProcesses;
module.exports.launchProcess = launchProcess;
module.exports.forkProcess = forkProcess;
