module.exports = context => {
  return {
    port: context.env.PORT,
    customKey: 'customValue'
  };
};
