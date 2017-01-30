const searchRegex = new RegExp('[^\\w|^\\-]', 'g');

module.exports = val => val.replace(searchRegex, '_');
