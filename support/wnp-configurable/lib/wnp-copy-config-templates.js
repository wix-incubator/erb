const shelljs = require('shelljs'),
  join = require('path').join,
  assert = require('assert');

module.exports = () => {
  const logPrefix = `wnp-copy-config-templates(${require(join(process.cwd(), 'package.json')).name}): NODE_ENV='${process.env.NODE_ENV}'`;

  if (isProduction()) {
    assert(process.env.APP_TEMPL_DIR, 'NODE_ENV=\'production\', but APP_TEMPL_DIR not set, cannot copy config templates.');
    const targetDir = join(process.env.APP_TEMPL_DIR, '');
    const srcDir = process.cwd() + '/templates';

    if (!shelljs.test('-d', srcDir)) {
      console.error(`${logPrefix}, but '${process.cwd()}/templates' does not exist - skipping...`);
    }

    if (shelljs.ls(srcDir).length === 0) {
      console.error(`${logPrefix}, but '${process.cwd()}/templates' is empty - skipping...`);
    }

    console.info(`${logPrefix}, copying configs from '${process.cwd()}/templates' to '${targetDir}'`);
    shelljs.mkdir('-p', targetDir);
    shelljs.cp('-R', srcDir + '/', targetDir + '/');
  } else {
    console.info(`${logPrefix}, skipping...`);
  }
};

function isProduction() {
  return process.env.NODE_ENV === 'production';
}
