'use strict';
const cluster = require('cluster');
const sendTimeout = 1000;
const panickTimeout = 1500;
const clientEvt = {type: 'client-app-health-ping'};
const parentEvt = {type: 'parent-health-ping'};

const parentErrorMessage = (app, timeout) => `Did not receive "ping" from child (${app}) within predefined timeout (${timeout} ms) - either client app died or you forgot to setup client module on child process. Please refer to documentation for details.`;
const childErrorMessage = (app, timeout) => `Did not receive "ping" from master (${app}) within predefined timeout (${timeout} ms) - Parent process died?. Suiciding...`;

module.exports.installOnMaster = (app, childProcess) => watcher(
  panickTimeout,
  clientEvt,
  () => { console.error(parentErrorMessage(app, panickTimeout)); childProcess.kill('SIGKILL'); },
  () => childProcess.send(parentEvt),
  fn => childProcess.on('message', fn));

module.exports.installOnClient = (app, timeout) => watcher(
  timeout || panickTimeout,
  parentEvt,
  () => {console.error(childErrorMessage(app, timeout || panickTimeout)); process.exit();},
  () => process.send(clientEvt),
  fn => process.on('message', fn));

function watcher(timeout, listenEvt, killFn, sendFn, onMessageFn) {
  let killer = setTimeout(killFn, timeout);
  killer = killer.unref();
  let listenerFn = evt => {
    if (cluster.isMaster) {
      if (evt.type && evt.type === listenEvt.type) {
        clearTimeout(killer);
        killer = setTimeout(killFn, timeout);
        killer = killer.unref();
      }
    }
  };

  sendFn();
  let pinger = setInterval(sendFn, sendTimeout);
  pinger = pinger.unref();
  onMessageFn(listenerFn);

  return () => {
    process.removeListener('message', listenerFn);
    clearTimeout(killer);
    clearInterval(pinger);
  };
}

