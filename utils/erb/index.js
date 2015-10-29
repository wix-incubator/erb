var spawn = require('child_process').spawn;

module.exports = function (template, data) {
  return new Promise(function (resolve, reject) {
    var compiler = spawn('ruby', [__dirname + '/compile.rb', '-', template]);
    compiler.on('error', reject);

    var stdout = [];
    compiler.stdout.on('data', function (chunk) {
      stdout.push(chunk);
    });
    var stderr = [];
    compiler.stderr.on('data', function (chunk) {
      stderr.push(chunk);
    });

    compiler.on('exit', function (code) {
      if (code === 0) {
        stdout = Buffer.concat(stdout);
        resolve(stdout.toString('utf8'));
      } else {
        stderr = Buffer.concat(stderr);
        reject(new Error('Exited with code ' + code + ':\n' + stderr));
      }
    });

    compiler.stdin.write(JSON.stringify(data));
    compiler.stdin.end();
  });
};
