'use strict';
const express = require('express');
module.exports = () => {
  return express()
    .get('/duration/:ms', (req, res) => {
      setTimeout(() => res.end(), req.params.ms);
    });
};