'use strict';
var express = require('express'),
    exchange = require('wix-cluster-exchange');

module.exports = function() {
  var app = express.Router();
  var exchangeServer = exchange.server('cluster-stats');
  var stats = {};
  var forked = 0;
  var died = 0;

  exchangeServer.onMessage(function(data) {
    if (data.type === 'stats') {
      stats[data.id] = data.stats;
    } else if (data.type === 'forked') {
      forked = forked + 1;
    } else if (data.type === 'died') {
      died = died + 1;
    }
  });

  app.get('/stats', function (req, res) {
    res.send(JSON.stringify({
      forked: forked,
      died: died,
      stats: stats
    }));
  });

  return app;
};