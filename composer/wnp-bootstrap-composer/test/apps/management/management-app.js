const express = require('express');

module.exports = () => {
  return new express.Router()
  .get('/custom', (req, res) => res.send('custom-from-management'));
};
