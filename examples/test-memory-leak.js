const assert = require('assert')
const erb = require('..')

async function main () {
  for (let i = 0; i < 100000; i++) {
    const output = await erb({ template: '<%= TRUE %>' })
    assert(output === 'true')
  }
}

main().catch(process.stderr.write)
