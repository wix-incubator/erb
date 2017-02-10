const express = require('express');

module.exports = context => {
  return new express.Router()
    .get('/management-1-arg', (req, res) => res.send(context.app.name));
};
