var vm = require('vm')

function runOpalScript (timeout, opalScript) {
  var context = { Buffer: Buffer }
  vm.runInNewContext(opalScript, context, { filename: 'opal.js', timeout: timeout })
  return context.output
}

module.exports = runOpalScript
