'use strict';
const fork = require('child_process').fork,
  debug = require('debug');

module.exports = (app, env, callback) => {
  const serverEvents = [];
  const clientEvents = [];

  const child = fork(`./test/apps/${app}.js`, [], {env: env});

  child.on('message', (event) => {
    const evtJsonStr = JSON.stringify(event);
    debug('received event: %s', evtJsonStr);
    if (event.src === 'server-exchange') {
      serverEvents.push(event);
    } else if (event.src === 'client-exchange') {
      clientEvents.push(event);
    } else {
      debug('givenScenario: received unmatched event: %s', evtJsonStr);
    }
  });

  child.on('exit', () => callback(serverEvents, clientEvents));
};