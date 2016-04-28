'use strict';
const express = require('express');

module.exports = () => {
  const app = express();

  app.get('/', (req, res) => res.end())
    .get('/aspects/web-context', (req, res) => res.json(req.aspects['web-context']))
    .get('/aspects/petri', (req, res) => res.json(req.aspects['petri'].cookies))
    .get('/aspects/bi', (req, res) => res.json(req.aspects['bi']))
    .get('/aspects/wix-session', (req, res) => res.json(req.aspects['session']))
    .get('/newrelic', (req, res) => {
      res.json({
        reqTimingHeaders: req.app.locals.newrelic.getBrowserTimingHeader(),
        appTimingHeaders: app.locals.newrelic.getBrowserTimingHeader()
      });
    })
    .get('/errors/unhandled-rejection', (req, res) => {
      Promise.reject(Error('unhandled-rejection'));
      setTimeout(() => res.end(), 200);
    })
    .get('/errors/async', req =>
      process.nextTick(() => {
        throw new Error(req.query.m);
      })
    )
    .get('/errors/sync', req => {
      throw new Error(req.query.m);
    })
    .get('/errors/timeout', (req, res) => {
      setTimeout(() => res.end(), req.query.ms);
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
    .get('/errors/async', req =>
      process.nextTick(() => {
        throw new Error(req.query.m);
      })
    )
    .get('/errors/sync', req => {
      throw new Error(req.query.m);
    })
    .get('/errors/timeout', (req, res) => {
      setTimeout(() => res.end(), req.query.ms);
    });

  app.use('/custom', router);

  return app;
};