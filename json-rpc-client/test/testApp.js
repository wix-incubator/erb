'use strict';

var express = require('express');
var app = express();
var jsonrpc = require('node-express-JSON-RPC2');

app.use('/SomePath', jsonrpc());

app.post('/NonJson', function (req, res) {
  res.send('hi');
});
app.post('/SomePath', function (req, res) {


  res.rpc('add', function (params, respond) {
    respond({ result: params[0] + params[1] });
  });

  res.rpc('foo', function (params, respond) {
    respond({ result: 'bar'});
  });


});


exports.listen = function (port, callback) {
  this.server = app.listen(port, callback);
};

exports.close = function (callback) {
  this.server.close(callback);
};