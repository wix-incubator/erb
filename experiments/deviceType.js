const parser = require('ua-parser-js');
const assert = require('assert');
const useragent = require('useragent');
const expressUseragent = require('express-useragent');

const chromeString = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/535.20 (KHTML, like Gecko) Chrome/19.0.1036.7 Safari/535.20';
const bingBotStr = 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)';
const googleBotMobile = 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_1 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8B117 Safari/6531.22.7 (compatible; Googlebot-Mobile/2.1; +http://www.google.com/bot.html)'

const chrome = parser(chromeString);

assert(chrome.browser.name == 'Chrome');
const googleBot = parser(bingBotStr);

// Not good, does not recognised bots :/ 
assert(googleBot.browser.name == undefined);


// Not the best, does not group it as bot
var bingBotFromUserAgent = useragent.parse(bingBotStr);
assert(bingBotFromUserAgent.family == 'bingbot');

var chromeFromUserAgent = useragent.parse(chromeString);
assert(chromeFromUserAgent.family == 'Chrome');

var bingBotfromExpUserAgent = expressUseragent.parse(bingBotStr);
assert(bingBotfromExpUserAgent.isBot == 'bingbot');
assert(bingBotfromExpUserAgent.isMobile == false);

var googleBotMobileFromExpUserAgent = expressUseragent.parse(googleBotMobile);
assert(googleBotMobileFromExpUserAgent.isBot == 'googlebot');
assert(googleBotMobileFromExpUserAgent.isMobile == true);

var chromefromExpUserAgent = expressUseragent.parse(chromeString);
assert(chromefromExpUserAgent.isBot == false);
assert(chromefromExpUserAgent.isMobile == false);
assert(chromefromExpUserAgent.isChrome == true);
assert(chromefromExpUserAgent.browser == 'Chrome');

