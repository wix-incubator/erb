'use strict';
const express = require('express');

module.exports = context => {
  const app = new express.Router();
  
  app.get('/hello', (req, res) => {
    setTimeout(() => res.send('hi'), 50);
  });

  return new express.Router().use('/api', app);
};