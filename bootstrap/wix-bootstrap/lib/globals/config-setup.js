'use strict';
module.exports.setup = () => {
  require('wix-config').setup(process.env.APP_CONF_DIR);
  require('wix-bootstrap-config').setup(process.env.APP_CONF_DIR);
};
