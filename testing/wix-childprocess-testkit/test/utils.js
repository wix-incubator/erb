'use strict';
const retry = require('retry-promise').default,
  expect = require('chai').expect;

function expectProcessesToBeAlive() {
  return retry(() => Promise.resolve().then(() => Array.from(arguments).forEach(pid => expect(isRunning(pid)).to.equal(true))));
}

function expectProcessesToNotBeAlive() {
  return retry(() => Promise.resolve().then(() => Array.from(arguments).forEach(pid => expect(isRunning(pid)).to.not.equal(true))));
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

module.exports.expectProcessesToBeAlive = expectProcessesToBeAlive;
module.exports.expectProcessesToNotBeAlive = expectProcessesToNotBeAlive;
module.exports.isRunning = isRunning;
module.exports.killProcess = killProcess;
