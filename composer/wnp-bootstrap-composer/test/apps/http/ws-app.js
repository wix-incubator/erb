const ws = require('ws');

module.exports = (httpServer, config) => {
  const wss = new ws.Server({ server: httpServer, path: config.mountPoint });
  wss.on('connection', ws => ws.on('message', message => ws.send(message)));
};
