'use strict';
const express = require('express');

module.exports = () => {
  return new express.Router()
    .get('/env', (req, res) => res.json(process.env));
};