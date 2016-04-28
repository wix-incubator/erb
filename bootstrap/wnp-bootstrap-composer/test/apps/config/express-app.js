'use strict';
const express = require('express');

module.exports = config => {
  return new express.Router()
  .get('/config', (req, res) => res.json(config));
};