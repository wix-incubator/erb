module.exports = context => {
  return {
    gatekeeper: aspects => context.gatekeeper.client(aspects)
  }
};
