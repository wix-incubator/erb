const express = require('express');

module.exports = context => {
  return new express.Router()
  .get('/config', (req, res) => res.json(context));
};
