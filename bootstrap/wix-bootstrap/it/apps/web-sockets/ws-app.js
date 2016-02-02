'use strict';
module.exports = wss => {
  wss.on('connection', ws => ws.on('message', message => ws.send(message)));
};