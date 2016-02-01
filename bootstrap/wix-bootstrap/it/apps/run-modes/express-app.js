'use strict';
module.exports = app => app.get('/env', (req, res) => res.json(process.env));