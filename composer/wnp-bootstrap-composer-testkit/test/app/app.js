'use strict';
const express = require('express');

module.exports = () => {
  return new express.Router()
    .get('/', (req, res) => res.end())
    .get('/env', (req, res) => res.json(process.env));
};