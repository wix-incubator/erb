module.exports = function (wallaby) {
  process.env.NODE_PATH += `:${require('path').join(wallaby.localProjectDir, 'node_modules')}`;
  return {
    files: [
      {pattern: 'lib/**', instrument: false},
      {pattern: 'templates/**', instrument: false},
      {pattern: 'test/environment.js'},
      {pattern: 'index.js', instrument: false},
      {pattern: 'package.json', instrument: false}
    ],

    tests: [
      {pattern: 'test/**/*.spec.js'}
    ],

    compilers: {
      '**/*.js*': wallaby.compilers.babel()
    },

    testFramework: 'mocha',

    setup: function () {
      require('babel-polyfill');
    },

    env: {
      type: 'node'
    }
  };
};
