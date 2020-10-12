var vm = require('vm')

function runOpalScript (timeout, opalScript) {
  var context = { Buffer: Buffer }

  try {
    vm.runInNewContext(opalScript, context, { filename: 'opal.js', timeout: timeout, displayErrors: false })
  } catch (err) {
    throw new Error(err.message)
  }

  return context.output
}

module.exports = runOpalScript
