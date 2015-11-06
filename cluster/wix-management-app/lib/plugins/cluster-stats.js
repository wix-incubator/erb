'use strict';
const express = require('express'),
    exchange = require('wix-cluster-exchange');

module.exports = function() {
  const app = express.Router();
  const exchangeServer = exchange.server('cluster-stats');
  const stats = {};
  let forked = 0;
  let died = 0;

  exchangeServer.onMessage(data => {
    if (data.type === 'stats') {
      stats[data.id] = data.stats;
    } else if (data.type === 'forked') {
      forked = forked + 1;
    } else if (data.type === 'died') {
      died = died + 1;
    }
  });

  app.get('/stats', (req, res) => {
    res.send(JSON.stringify({
      forked: forked,
      died: died,
      stats: stats
    }));
  });

  return app;
};