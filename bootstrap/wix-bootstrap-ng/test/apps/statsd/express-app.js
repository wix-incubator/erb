const express = require('express');

module.exports = context => {

  return express().post('/meter', (req, res) => {
    context.metrics.meter(req.query.key);
    res.end()
  });
};