'use strict';

const mismatchedPublicKey =
  `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3vS2nXhT51M1ldmT2orI
jbxYP36Mh0PAMuvRdVffZ1gKalKE6FZxKaILflKrUGXCq24HJDHWRxduF0nIk2JI
g3O9kD8pQGmdo9G7QLApFoXIWidhYjAcx5A9ASM9MLsECwBbUcXwhkFgDMCcjVRw
VJPtX/U5fkUEwGME9VSG8UJvYZTiwAqJIU1ko/UT7QT2ho7f172TCckDuqcFc6LO
WJ/ZC6XeUuQa1M5vqs/7uhsHLGuVd1B+RBc6lbozDV0eJOhqgzKZvjm13jRsyjZY
p1yTlwbJyJ39A5PMFYtRl8SasC6yIvSihHwGTCrgTYeOdDaVOSNp8J5fz6L/qiK0
8wIDAQAB
-----END PUBLIC KEY-----`;

module.exports = {
  token: 'WJT.eyJraWQiOiI2ZGI1ZjllZDEwODY5N2ZiIiwiYWxnIjoiUlMyNTYifQ.eyJkYXRhIjoie1widXNlckd1aWRcIjpcImUxMTk1NjU3LTUwZTYtNGUzZS1iMWNmLTVkZDQxZTk0OGY0ZlwiLFwidXNlck5hbWVcIjpcInZvekJhaGQ1VHlxUUZNaWs3Q20wXCIsXCJjb2xvcnNcIjpudWxsLFwidXNlckNyZWF0aW9uRGF0ZVwiOlwiMTk3MC0wMS0wMVQwMDowMDowMC4wMDArMDAwMFwiLFwid2l4U3RhZmZcIjpmYWxzZSxcImVtYWlsV2l0aFdpeERvbWFpblwiOmZhbHNlLFwicmVtZW1iZXJlZFwiOmZhbHNlLFwic2Vzc2lvbkNyZWF0aW9uRGF0ZVwiOlwiMTk3MC0wMS0wMVQwMDowMDowMC4wMDArMDAwMFwiLFwibGFzdFZhbGlkYXRpb25UaW1lXCI6XCIxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMCswMDAwXCIsXCJsYXN0QXV0aFRpbWVcIjpcIjE5NzAtMDEtMDFUMDA6MDA6MDAuMDAwKzAwMDBcIixcImV4cGlyYXRpb25cIjpcIjIwMTYtMDItMTJUMTI6NDk6MzcuMTA4KzAwMDBcIn0iLCJpYXQiOjE0NTUxOTQ5NzcsImV4cCI6MTQ1NjQwNDU3N30.bVJiL8pk2BoGgrbkofBR7wb8kyFLIgTRQ1nqKdIcTUgDY3KOSCqR0zRTa3xXi4aLSoI4bND6M8IKnXe2bvO31o1qYi1wXx1qnH9Noqu3ooP10HqPLtnHIRg58q9PiRfQZNkcHbOcvRCmlXnJbfOFbVuEYzcrMKE97nTn6xHm7lirMKRAQy50PB-S_0ixobEebMQZq6fPZdfOfQJCnNQIU7qNI8qXMaPun7HYT85QeFgcDklYEYX7eWl0OAkuwLO4UI3jcu4ekeSsVI0MMwEm0IC2xGngnj1wCOrIDVRm8NoRLlJyNbcQW7OGMFCO05w2dD2IWD8U_TC1qrPFMSr2EA',
  objectInToken: {
    userGuid: 'e1195657-50e6-4e3e-b1cf-5dd41e948f4f',
    userName: 'vozBahd5TyqQFMik7Cm0',
    colors: null,
    userCreationDate: new Date('1970-01-01T00:00:00.000+0000'),
    wixStaff: false,
    emailWithWixDomain: false,
    remembered: false,
    sessionCreationDate: new Date('1970-01-01T00:00:00.000+0000'),
    lastValidationTime: new Date('1970-01-01T00:00:00.000+0000'),
    lastAuthTime: new Date('1970-01-01T00:00:00.000+0000'),
    expiration: new Date('2016-02-12T12:49:37.108+0000')
  },
  validKey: require('../../lib/wix-new-session-crypto').devKey,
  invalidKey: mismatchedPublicKey
};