var express = require('express');
var app = express();
var http = require('http');

var stats = {
  m: [],
  n: []
};

for (var i=0; i < 100; i++)
  app.use("/m", m);

function m(req, res, next) {
  req.times = req.times || [];
  req.start = req.start || process.hrtime();
  req.times.push(hrtimeToMilliSec(process.hrtime(req.start)));
  next();
}

app.get("/m", function(req, res) {
  var time = req.times[req.times.length-1]/100;
  res.send("time: "+ time);
  stats.m.push(time);
});


var hooks = [];
for (var i=0; i<100; i++) {
  hooks.push(nn);
}

function nn(req, res) {
  req.times = req.times || [];
  req.start = req.start || process.hrtime();
  req.times.push(hrtimeToMilliSec(process.hrtime(req.start)));
}

function n(req, res, next) {
  hooks.forEach(function(fn) {
    fn(req, res);
  });
  next();
}

app.use("/n", n);
app.get("/n", function(req, res) {
  var time = req.times[req.times.length-1]/100;
  res.send("time: "+ time);
  stats.n.push(time);
});

app.get("/s", function(req, res) {
  var nsum = stats.n.reduce(function(prev, curr) {return prev + curr;});
  var msum = stats.m.reduce(function(prev, curr) {return prev + curr;});
  res.send("middleware: " + (msum/stats.m.length) + " mSec, "+stats.m.length+ " calls </br>" +
    "hooks: " + (nsum/stats.n.length) + " mSec, "+ stats.n.length + " calls")
});

app.listen(1234);


function makeRequest(num) {
  if (num < 2000) {
    if (num % 2 == 0)
      http.get("http://localhost:1234/m", function(res) {
        process.stdout.write(".");
        makeRequest(num+1);
      });
    else
      http.get("http://localhost:1234/n", function(res) {
        process.stdout.write(".");
        makeRequest(num+1);
      });
  }
}

makeRequest(0);



function hrtimeToMilliSec(hr) {
  return hr[0] * 1000 + hr[1] / 1000000;
}
