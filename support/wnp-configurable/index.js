const join = require('path').join,
  assert = require('assert'),
  {readdirSync, statSync} = require('fs'),
  {execSync} = require('child_process');

module.exports = () => {
  const logPrefix = `wnp-copy-config-templates(${require(join(process.cwd(), 'package.json')).name}): NODE_ENV='${process.env.NODE_ENV}'`;

  if (isProduction()) {
    assert(process.env.APP_TEMPL_DIR, 'NODE_ENV=\'production\', but APP_TEMPL_DIR not set, cannot copy config templates.');
    const targetDir = join(process.env.APP_TEMPL_DIR, '');
    const srcDir = process.cwd() + '/templates';

    if (!directoryExists(srcDir)) {
      console.error(`${logPrefix}, but '${srcDir}' does not exist - skipping...`);
      return;
    }

    if (listFiles(srcDir).length === 0) {
      console.error(`${logPrefix}, but '${srcDir}' is empty - skipping...`);
      return;
    }

    console.info(`${logPrefix}, copying configs from '${srcDir}' to '${targetDir}'`);
    execSync(`cp -R ${srcDir}/* ${targetDir}/`);
  } else {
    console.info(`${logPrefix}, skipping...`);
  }
};

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function directoryExists(path) {
  try {
    return statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
}

function listFiles(path) {
  try {
    return readdirSync(path)
  } catch (e) {
    return [];
  }
}
