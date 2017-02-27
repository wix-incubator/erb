module.exports = (app, context) => {
  return app
    .get('/info', (req, res) => res.json({ pid: process.pid }))
    .get('/env', (req, res) => res.json(context)); // use context for eslint
};

