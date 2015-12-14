'use strict';

require('../..')({
  appPort: process.env.PORT,
  managementPort: process.env.MANAGEMENT_PORT,
  mountPoint: process.env.MOUNT_POINT
}).start();