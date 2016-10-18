'use strict';
const colors = require('colors');

class Logger {
  constructor() {

  }

  info(str) {
    console.log('  ' + str.green);
  }

  plain(str) {
    console.log(str);
  }


  warn(str) {
    console.log('  ' + str.yellow);
  }


  error(str) {
    console.log('  ' + str.red);
  }

  exec(str, fn) {
    console.log((`Executing '${str}'`).green.underline);
    fn();
  }

  for(str, fn) {
    console.log(' ' + str.green);
    fn();
  }

}

module.exports = () => new Logger();
