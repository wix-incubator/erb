'use strict';

module.exports.addTo = app => {
  app.all('/health/is_alive', (req, res) => {
    (req.method === 'HEAD') ? head(res) : res.send('Alive');

  });
};

var head = res =>{
  res.writeHead(200, {'Content-Length': 0});
  res.end('');
};