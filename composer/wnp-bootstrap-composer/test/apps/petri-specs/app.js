const mySpecs = require('./specs');

module.exports = (app, context) => {
  context.petri.addSpecs(mySpecs);
  return app;
};
