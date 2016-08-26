
module.exports = (opts) => {
  
}

function launchWatcher(pidRegistry) {
  return new Promise((resolve, reject) => {
    let output = '';

    const child = spawn('node', ['./lib/watchman.js'], {
      env: Object.assign({}, process.env, {PARENT_PID: registry.parentPid, WATCHED_PID: registry.childPid}),
      detached: true
    });
    pidRegistry['watcherPid'] = child.pid;

    child.stdout.on('data', data => {
      console.log(data.toString());
      output += data.toString();
      if (output.indexOf('watcher started') > -1) {
        resolve(child.pid);
      }
    });

    child.stderr.on('data', data => {
      console.log(data.toString());
      output += data.toString();
    });

    child.on('exit', code => resolve({pid: child.pid, error: Error('child exited with code ' + code)}));
    child.on('error', err => resolve({pid: child.pid, error: err}));
    child.on('message', msg => {
      if (msg === 'ready') {
        resolve({pid: child.pid});
      }
    });
  });
}
