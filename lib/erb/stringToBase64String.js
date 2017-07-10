function stringToBase64String (string) {
  return Buffer.from(string, 'utf8').toString('base64')
}

module.exports = stringToBase64String
