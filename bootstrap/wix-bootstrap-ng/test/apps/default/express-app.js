module.exports = (app, context) => {
  return app
    .get('/env', (req, res) => res.json(context.env))
    .get('/die', () =>
      process.nextTick(() => {
        throw new Error('die from uncaught');
      })
    );
};
