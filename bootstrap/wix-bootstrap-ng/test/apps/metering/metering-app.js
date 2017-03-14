const express = require('express');

module.exports = () => {
  return express().get('/my-route', (req, res) => res.send('ok'));
};
