'use strict';
var express = require('express');

module.exports = function () {
  var app = express();

  app.get('/', function(req, res) {
    setTimeout(function() {
      res.write('Hello');
      res.end();
    }, 500);
  });

  app.get('/die', function(req, res) {
    process.nextTick(function() {
      throw 'Error';
    });
    res.end();
  });

  app.listen(3000);
};