const express = require('express');

module.exports = context => {
  return new express.Router()
    .get('/composer-1-arg', (req, res) => res.send(context.app.name));
};
