['npm install', 'spjs-build'].forEach(cmd => {
  const result = require('child_process').spawnSync('sh', ['-c', cmd], {stdio: 'inherit'});
  if (result.status) {
    process.exit(result.status);
  }
});