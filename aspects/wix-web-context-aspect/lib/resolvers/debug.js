
exports.resolve = (query) => {
  return query['debug'] === 'true' || query['debug'] === '';
};
