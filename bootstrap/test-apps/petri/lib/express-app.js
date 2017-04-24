const specs = require('./petri-specs'),
  exphbs  = require('express-handlebars');

module.exports = (app, context) => {
  context.petri.addSpecs(specs.all);
  const petriClient = aspects => context.petri.client(aspects);

  app.engine('handlebars', exphbs({defaultLayout: 'main'}));
  app.set('view engine', 'handlebars');
  
  // conducting experiment on server        
  app.get('/api/to-live-or-not', (req, res, next) => {
    // conduct the experiment in your code
    petriClient(req.aspects)
      .conductExperiment(specs.keys.MySpecForExperiment2, 'fallback-value')
      .then(resp => {
        switch (resp) {

          case 'kill':
            res.send('we killed kenny');
            break;

          case 'kill-not':
            res.send('we will kill kenny later');
            break;

          // either the experiment is not defined (yet/already) or we failed to talk to the laboratory server
          case 'fallback-value':
            res.send('booring booring booring');
        }
      }).catch(next);
  });

  // propagating conducted experiments to the client
  app.get('/index', (req, res, next) => {
    petriClient(req.aspects)
      .conductAllInScope('my-service-scope')
      .then(experiments => res.render('index', {
        experimentsForTheClient: JSON.stringify(experiments),
        layout: false})) // assuming we have a view with that name
      .catch(next);
  });
  
  return app;
};
