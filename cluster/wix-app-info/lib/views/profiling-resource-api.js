const Router = require('express').Router;

module.exports.profilingResourceApi = (dumper, mounthPath) => {
  const router = new Router();

  router.get('/', (req, res) => {
    dumper.list()
      .then(profiles => res.status(200).json({ profiles: profiles }));
  });

  router.post('/generate', (req, res) => {
    dumper.generate(req.query);
    res.status(202).json({ message: 'Submitted profiling job', resultUrl: mounthPath });
  });

  router.get('/download/:id', (req, res) => {
    dumper.get(req.params.id)
      .then((content) => {
        res.status(200)
          .set({
            'Content-type': 'application/octet-stream',
            'Content-disposition': `attachment; filename=${req.params.id}.zip`
          })
          .send(content);
      })
      .catch(() => res.status(404).json({ message: `Archive with id [${req.params.id}] not found` }));
  });

  return router;
};
