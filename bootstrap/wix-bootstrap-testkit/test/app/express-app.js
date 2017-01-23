const express = require('express'),
  cluster = require('cluster');

module.exports = () => {
  return new express.Router()
    .get('/info', (req, res) => res.json({isWorker: cluster.isWorker, pid: process.pid}));
};
