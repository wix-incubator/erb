'use strict';
const express = require('express');

module.exports = () => {
  return new express.Router()
  .get('/composer', (req, res) => res.send('composer'));
};