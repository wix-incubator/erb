var expect = require('chai').expect;
var wixSession = require('../index')({'mainKey': 'kukuriku_1111111'});
var Chance = require('chance');

var chance = new Chance();

var token = "7ae0809c055858520a60b8c5d91f4f31024ab27d331d6f10baf206332c83ff9379655dfeb929cd18faf7aaad3a7df50c6d3f905f99ef14d93def7b14666d7c7c08399d90aaf1f47aa8ac1a29e92b308364a9559e20600ff77aa1a769bcb7482729a0376950e103160b547d8cb619177d8cb169914f52b5f9911160da03fd88608e8aa26bd03664144c370b15afdf17e068d75820e3b15ffcff99ad3853c1a3f43f36a6693785c282f884ab44bbae16f6ba480412ab8ec09a4d364ee0aba24888e3200a765acdcb5e18a8049495df892564bed41acc9c6e928f9aadbb13406432";


describe("wix session  decode", function () {
    it("decode a valid session", function () {
        expect(wixSession.fromStringToken(token)).to.satisfy(function(session) {
            return session.email == 'someuser@wix.com' &&
                session.userName == 'someuser' &&
                session.userGuid == "11c23318-9006-414a-87cc-522649d327d7";
        });
    });
});

