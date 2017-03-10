require('express')()
  .get(process.env.MOUNT_POINT, (req, res) => res.end())
  .post(process.env.MOUNT_POINT, (req, res) => res.end())
  .get(process.env.MOUNT_POINT + '/test', (req, res) => res.end())
  .get(process.env.MOUNT_POINT + '/201', (req, res) => res.status(201).end())
  .get(process.env.MOUNT_POINT + '/500', (req, res) => res.status(500).end())
  .listen(process.env.PORT);
