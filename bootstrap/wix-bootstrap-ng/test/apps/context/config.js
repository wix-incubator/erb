
module.exports = context => {
  return {
    config: context.config,
    session: context.session,
    newrelic: context.newrelic
  };
};
