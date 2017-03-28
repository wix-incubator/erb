module.exports.middleware = gatekeeperClient => ({scope, action}) => {
  const permission = {scope, action};
  return getMetasiteId => (req, res, next) => {
    const metasiteId = getMetasiteId(req);
    return gatekeeperClient(req.aspects)
      .authorize(metasiteId, permission)
      .then(() => next())
      .catch(next);
  }
};
