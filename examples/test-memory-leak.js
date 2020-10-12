const assert = require('assert')
const erb = require('..')

async function main () {
  let minDuration = Number.POSITIVE_INFINITY
  let maxMemoryUsed = 0
  while (true) {
    const time = Date.now()
    const output = await erb({ template: '<%= TRUE %>' })
    minDuration = Math.min(minDuration, Date.now() - time)
    maxMemoryUsed = Math.max(maxMemoryUsed, Math.round(process.memoryUsage().heapUsed / 1024 / 1024))
    console.log(`maximum ${maxMemoryUsed} megabytes, minimum ${minDuration} milliseconds`)
    assert(output === 'true')
  }
}

main().catch(process.stderr.write)
