
function stringToBase64String(string) {
  return new Buffer(string, 'utf8').toString('base64');
}

module.exports = stringToBase64String;
