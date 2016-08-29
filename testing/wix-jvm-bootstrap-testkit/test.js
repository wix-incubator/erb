const unzip = require('unzip'),
  fs = require('fs');

fs.createReadStream('./target/jvm/test-server-1.0.0-SNAPSHOT-deployable.jar').pipe(unzip.Extract({ path: './target' }));
