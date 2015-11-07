const parser = require('ua-parser-js');
const assert = require('assert');
const useragent = require('useragent');
const chromeString = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/535.20 (KHTML, like Gecko) Chrome/19.0.1036.7 Safari/535.20';
const chrome = parser(chromeString);

assert(chrome.browser.name == 'Chrome');

const bingBotStr = 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)';
const googleBot = parser(bingBotStr);

// Not good, does not recognised bots :/ 
assert(googleBot.browser.name == undefined);


// Not the best, does not group it as bot
var bingBotFromUserAgent = useragent.parse(bingBotStr);
assert(bingBotFromUserAgent.family == 'bingbot');

var chromeFromUserAgent = useragent.parse(chromeString);
console.log(chromeFromUserAgent);
assert(chromeFromUserAgent.family == 'Chrome');