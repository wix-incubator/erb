'use strict';
const express = require('express'),
  controller = require('./express');

module.exports = () => controller('/router', new express.Router());