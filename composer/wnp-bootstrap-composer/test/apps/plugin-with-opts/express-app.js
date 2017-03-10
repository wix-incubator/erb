const express = require('express');

module.exports = config => {
  return new express.Router()
  .get('/plugin', (req, res) => res.send(config));
};
