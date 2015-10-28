'use strict';
var express = require('express');
var app = express();

app.get('/a', function (req, res) {
  console.log(req.route.path);
  res.send('/a ' + req.baseUrl);
});

app.get('/b/*', function (req, res) {
  console.log(req.route.path);
  res.send('/b/* ' + req.baseUrl);
});

app.get('/user/:id', function (req, res) {
  console.log(req.route.path);
  res.send('/user/:id ' + req.baseUrl);
});

app.get('/z+', function (req, res) {
  console.log(req.route.path);
  res.send('/z+ ' + req.baseUrl);
});

app.get('/*', function (req, res) {
  console.log(req.route.path);
  res.send('* ' + req.baseUrl);
});

app.listen(3001);

