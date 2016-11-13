const path = require('path'),
  shelljs = require('shelljs');

module.exports = cwd => {
  return JSON.parse(shelljs.cat(path.join(cwd, 'octopus.json')).stdout)
};

// module.exports = cwd => {
//   const config = JSON.parse(shelljs.cat(__dirname + '/../../octopus.json').stdout)
// };
