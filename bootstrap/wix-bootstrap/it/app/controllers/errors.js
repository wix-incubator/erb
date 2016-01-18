'use strict';
module.exports.addTo = app => {

  app.get('/errors/async', req =>
    process.nextTick(() => {
      throw new Error(req.query.m);
    })
  );

  app.get('/errors/sync', req => {
    throw new Error(req.query.m);
  });

  app.get('/errors/timeout', (req, res) => {
    setTimeout(() => res.end(), req.query.ms);
  });
};