'use strict';
const express = require('express');

module.exports = (path, app) => {
  app.get(path, (req, res) => res.end())
    .get(path + 'aspects/web-context', (req, res) => res.json(req.aspects['web-context']))
    .get(path + 'aspects/petri', (req, res) => res.json(req.aspects['petri'].cookies))
    .get(path + 'aspects/bi', (req, res) => res.json(req.aspects['bi']))
    .get(path + 'aspects/wix-session', (req, res) => res.json(req.aspects['session']))
    .get(path + 'newrelic', (req, res) => {
      res.json({
        reqTimingHeaders: req.app.locals.newrelic.getBrowserTimingHeader(),
        appTimingHeaders: req.app.locals.newrelic.getBrowserTimingHeader()
      });
    })
    .get(path + 'errors/unhandled-rejection', (req, res) => {
      Promise.reject(Error('unhandled-rejection'));
      setTimeout(() => res.end(), 200);
    })
    .get(path + 'errors/async', req =>
      process.nextTick(() => {
        throw new Error(req.query.m);
      })
    )
    .get(path + 'errors/sync', req => {
      throw new Error(req.query.m);
    })
    .get(path + 'errors/timeout', (req, res) => {
      setTimeout(() => res.end(), req.query.ms);
    })
    .get(path + 'req/ip', (req, res) => {
      res.json({ip: req.ip});
    });

  const router = new express.Router()
    .use((req, res, next) => {
      res.on('x-error', err => {
        res.status(500).send({name: err.name, message: 'custom-' + err.message});
        next();
      });
      next();
    })
    .use((req, res, next) => {
      res.once('x-timeout', () => {
        res.status(504).send({name: 'x-timeout', message: 'custom-timeout'});
        next();
      });
      next();
    })
    .get(path + 'errors/async', req =>
      process.nextTick(() => {
        throw new Error(req.query.m);
      })
    )
    .get(path + 'errors/sync', req => {
      throw new Error(req.query.m);
    })
    .get(path + 'errors/timeout', (req, res) => {
      setTimeout(() => res.end(), req.query.ms);
    })
    .get(path + 'req/ip', (req, res) => {
      res.json({ip: req.ip});
    });

  app.use(path + 'custom', router);

  return app;
};