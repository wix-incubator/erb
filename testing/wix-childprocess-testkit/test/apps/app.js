'use strict';
const express = require('express');


module.exports = function () {
  const app = express();

  app.get('/', function(req, res) {
    res.write('Hello');
    res.end();
  });

  app.listen(3000);
  console.log('App listening on port: %s', 3000);
};