const spawn = require('child_process').spawnSync;

const result = spawn('sh', ['-c', 'npm install && npm prune && node_modules/.bin/spjs-build'], {stdio: 'inherit'});
if (result.status) {
  process.exit(result.status);
}
