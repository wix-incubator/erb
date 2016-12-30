const express = require('express');

module.exports = () => {
  return new express.Router()
  .get('/composer', (req, res) => res.send('composer'))
  .get('/composer-1-arg', (req, res) => res.send('ok'));
};
