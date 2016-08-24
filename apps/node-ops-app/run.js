process.env.APP_CONF_DIR = './target/configs';

require('wix-config-emitter')({sourceFolders: ['./templates'], targetFolder: './target/configs'})
  .fn('statsd_host', 'metrics.wixpress.com')
  .emit()
  .then(() => require('./index'));
