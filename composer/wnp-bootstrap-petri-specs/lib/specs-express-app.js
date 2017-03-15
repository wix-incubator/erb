module.exports = ({thenableFn, app}) => {
  return app.post('/sync-specs', (req, res, next) => {
    thenableFn()
      .then(result => res.status(200).json(result).end())
      .catch(next);
  });
};
