'use strict';
const cluster = require('cluster');

const sendTimeout = 1000;
const panickTimeout = 1500;
const clientEvt = {type: 'client-app-health-ping'};
const parentEvt = {type: 'parent-health-ping'};

const parentErrorMessage = timeout => `Did not receive "ping" from child within predefined timeout (${timeout} ms) - either client app died or you forgot to setup client module on child process. Please refer to documentation for details.`;
const childErrorMessage = timeout => `Did not receive "ping" from master within predefined timeout (${timeout} ms) - Parent process died?. Suiciding...`;

module.exports.installOnMaster = childProcess => watcher(panickTimeout, clientEvt,
  () => { console.error(parentErrorMessage(panickTimeout)); childProcess.kill(); },
  () => childProcess.send(parentEvt),
  fn => childProcess.on('message', fn));

module.exports.installOnClient = timeout => watcher(timeout || panickTimeout, parentEvt,
  () => {console.error(childErrorMessage(timeout)); process.exit(1);},
  () => process.send(clientEvt),
  fn => process.on('message', fn));

function watcher(timeout, listenEvt, killFn, sendFn, onMessageFn) {
  let killer = setTimeout(killFn, timeout);
  let listenerFn = evt => {
    if (cluster.isMaster) {
      if (evt.type && evt.type === listenEvt.type) {
        clearTimeout(killer);
        killer = setTimeout(killFn, timeout);
      }
    }
  };

  sendFn();
  const pinger = setInterval(sendFn, sendTimeout);
  onMessageFn(listenerFn);

  return () => {
    process.removeListener('message', listenerFn);
    clearTimeout(killer);
    clearInterval(pinger);
  };
}

