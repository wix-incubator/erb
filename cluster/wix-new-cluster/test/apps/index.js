'use strict';
var express = require('express'),
  cluster = require('cluster');

module.exports = () => {
  var app = express();

  app.get('/', (req, res) => res.send('ok'));
  app.get('/random-delay', (req, res) => {
    setTimeout(() => res.send('ok'), Math.floor((Math.random() * 1000) + 1));
  });
  app.get('/die', (req, res) => {
    process.nextTick(() => {
      res.end();
      throw new Error('die');
    });
  });

  const server = require('http').createServer(app);
  const closeFn = () => new Promise((resolve, reject) => server.close(err => err ? reject(err): resolve()));
  return new Promise(resolve => server.listen(process.env.PORT, () => {
    console.log('server listening on', process.env.PORT);
    resolve(closeFn);
  }));
};