'use strict';
const express = require('express');
module.exports = () => {
  return express()
    .get('/die', () =>
      process.nextTick(() => {
        throw new Error('die from uncaught');
      })
    );
};