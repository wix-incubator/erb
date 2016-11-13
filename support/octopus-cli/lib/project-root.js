const findup = require('findup-sync'),
  dirname = require('path').dirname;

module.exports = (cwd, log) => {
  const dir = findup('octopus.json', {cwd, noCase: true});
  if (!dir) {
    log.error('Must execute either in project root (octopus.json) or sub-folder of project');
    process.exit(1);
  }
  return dirname(dir);
};
