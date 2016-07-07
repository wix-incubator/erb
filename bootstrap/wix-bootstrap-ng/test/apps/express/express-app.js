'use strict';
const express = require('express');
module.exports = () => {
  return express()
    .get('/req-context', (req, res) => res.json(req.aspects['web-context']))
    .get('/wix-session', (req, res) => res.json(req.aspects['session']))
    .get('/cache-control', (req, res) => res.end())
    .get('/newrelic', (req, res) => res.json({
      reqTimingHeaders: req.app.locals.newrelic.getBrowserTimingHeader(),
      appTimingHeaders: req.app.locals.newrelic.getBrowserTimingHeader()
    }));
};