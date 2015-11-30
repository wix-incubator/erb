'use strict';
const cluster = require('cluster');

const sendTimeout = 1000;
const panickTimeout = 1500;
const clientEvt = {type: 'client-app-health-ping'};
const parentEvt = {type: 'parent-health-ping'};

const parentErrorMessage = 'Did not receive "ping" from child within predefined timeout - either client app died or you forgot to setup client module on child process. Please refer to documentation for details.';
const childErrorMessage = 'Did not receive "ping" from master within predefined timeout - Parent process died?. Suiciding...';

module.exports.installOnMaster = childProcess => watcher(panickTimeout, clientEvt,
  () => { console.error(parentErrorMessage); childProcess.kill(); },
  () => childProcess.send(parentEvt));

module.exports.installOnClient = timeout => watcher(timeout || panickTimeout, parentEvt,
  () => {console.error(childErrorMessage); process.exit(1);},
  () => process.send(clientEvt));

function watcher(timeout, listenEvt, killFn, sendFn) {
  let killer = setTimeout(() => killFn(), panickTimeout);
  let listenerFn = evt => {
    if (cluster.isMaster) {
      if (evt.type && evt.type === listenEvt.type) {
        clearTimeout(killer);
        killer = setTimeout(() => killFn(), timeout);
      }
    }
  };

  sendFn();
  const pinger = setInterval(() => sendFn(), sendTimeout);
  process.on('message', listenerFn);

  return () => {
    process.removeListener('message', listenerFn);
    clearTimeout(killer);
    clearInterval(pinger);
  }
}

