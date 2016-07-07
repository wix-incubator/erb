'use strict';
const express = require('express');

module.exports = () => {
  return new express.Router()
    .get('/', (req, res) => res.end())
    .get('/env', (req, res) => res.json(process.env))
    .get('/outerr', (req, res) => {
      console.log('an out');
      console.error('an err');
      res.end();
    })
    .get('/out', (req, res) => {
      console.log('an out');
      res.end();
    })
  .get('/err', (req, res) => {
    console.error('an err');
    res.end();
  });
};