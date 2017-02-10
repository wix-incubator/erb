const express = require('express');

module.exports = context => {
  return new express.Router()
    .get('/env', (req, res) => res.json(context.env));
};
