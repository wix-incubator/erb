var app = require('express')();
var request = require('request');
var assert = require('assert');

app.get('/', function(req, res){
  res.cookie('foo', 'foo1');
  res.cookie('foo', 'foo2');
  res.end('hello')
});

var server = app.listen(3333);

request.get('http://localhost:3333/', function(error, response, body){
  assert(response.headers['set-cookie'][0] === 'foo=foo1; Path=/');
  assert(response.headers['set-cookie'][1] === 'foo=foo2; Path=/');
  server.close();
});