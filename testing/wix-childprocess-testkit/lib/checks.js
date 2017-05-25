const join = require('path').join,
  fetch = require('node-fetch');

module.exports.http = (url, opts) => new HttpCheck(url, opts);
module.exports.httpGet = path => new HttpGetCheck(path);
module.exports.stdErrOut = str => new StdErrOutCheck(str);

function HttpCheck(url, opts) {
  return () => fetch(url, Object.assign({}, {timeout: 1000}, opts)).then(res => {
    if (!res.ok) {
      throw new Error(`Server returned status: ${res.status}, when expected 200`);
    }
  });
}

function HttpGetCheck(path) {
  return checkOpts => new HttpCheck(`http://localhost:${checkOpts.env.PORT}${join(checkOpts.env.MOUNT_POINT || '/', path)}`)();
}

function StdErrOutCheck(str) {
  return checkOpts => new Promise((resolve, reject) => {
    if (checkOpts.output.indexOf(str) < 0) {
      reject(new Error(`'${str}' not found in stdout+stderr`));
    } else {
      resolve();
    }
  })
}
