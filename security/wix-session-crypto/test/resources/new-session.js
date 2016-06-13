'use strict';

const mismatchedPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3vS2nXhT51M1ldmT2orI
jbxYP36Mh0PAMuvRdVffZ1gKalKE6FZxKaILflKrUGXCq24HJDHWRxduF0nIk2JI
g3O9kD8pQGmdo9G7QLApFoXIWidhYjAcx5A9ASM9MLsECwBbUcXwhkFgDMCcjVRw
VJPtX/U5fkUEwGME9VSG8UJvYZTiwAqJIU1ko/UT7QT2ho7f172TCckDuqcFc6LO
WJ/ZC6XeUuQa1M5vqs/7uhsHLGuVd1B+RBc6lbozDV0eJOhqgzKZvjm13jRsyjZY
p1yTlwbJyJ39A5PMFYtRl8SasC6yIvSihHwGTCrgTYeOdDaVOSNp8J5fz6L/qiK0
8wIDAQAB
-----END PUBLIC KEY-----`;

module.exports = {
  token: 'JWT.eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0NjU5MTEyMjM1ODYsImRhdGEiOiJ7XCJ3eGV4cFwiOlwiMjAxNi0wNi0xNFQxMzozMzo0My41ODZaXCIsXCJybWJcIjpmYWxzZSxcInVjZFwiOlwiMjAyMC0wMS0wN1QwNzoxNDo0MC4yNTBaXCIsXCJ1c2VyR3VpZFwiOlwiMTA2MmNiZjAtMDEwMC01NWIxLThkMzgtNjI2ZGYxYWQ4ZmE1XCIsXCJ1c2VyTmFtZVwiOlwiemFvd2lcIixcInd4c1wiOmZhbHNlfSIsImlhdCI6MTQ2NTgyNDgyM30.Jb9K9hGTHXZX4Q5mQ4xylnxrrKxqTppKX4HGvEUlJObuPr_RoRMHe78MX9ZMeYtTxcHbfUESt3DlNT-3apT-zvNO1jTwQvDHbrb78ChdKcuECLf8cwOMfmq4yzhcpuMZSd1i8fWDS1aQ_NmOfwCEyvvx0MMHEAjFxU2YNuCJXGq0d_zz1dvvup-xgk9ggoIkRjWiX8hNQ5Yq479r5EjOTZcsPWtUJwG0IKmgzUMJ7saeJZy93CNZ08dQmYdgfaRjym8B6PAy4lWuXVZaoSfPLHT3LUbQSeij_DJqGN-bc8QnrJDLpVHtZDlDSRFMsmTk3RNHJb16hmBCQZ8MJRW_jA',
  objectInToken2: {
    userGuid: '1062cbf0-0100-55b1-8d38-626df1ad8fa5',
    userName: 'zaowi',
    ucd: '2020-01-07T07:14:40.250Z',
    wxs: false,
    rmb: true,
    wxexp: '2016-06-14T13:33:43.586Z'
  },
  objectInToken: {
    userGuid: '1062cbf0-0100-55b1-8d38-626df1ad8fa5',
    userName: 'zaowi',
    userCreationDate: new Date('2020-01-07T07:14:40.250Z'),
    wixStaff: false,
    remembered: false,
    expiration: new Date('2016-06-14T13:33:43.586Z')
  },
  validKey: require('../../lib/wix-new-session-crypto').devKey,
  validKeyInInvalidFormat: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApbgo7FKL3xjgA+Yq3RQgXKA8yWGsgKQI6xUDZ2tDekiMr5PypTGedJSUzkqc3dD472MLPZJoWPzxtVfJuzYDlXXTyyG7Gs+wW2rLJXSJHqKc6tPV4PNB3dIVxvztmOIZWa4v8cbYLQ7jO+vT7jBOM1iByVvrwI7gjmSJh58vWLCIy4cZOwfA4F12kQpl+s3/G4dgYjuhf6htjmXBW2M+x0mKBLeW4U7YFKsdYsEzTFHj8u0q4+uFKjNwCDzYl5yWW+ddo721cro5kbfH2HfVj0bmTFiP4sE2B0Bpcy7T92k7k2hlUSu339yl9NwWukqpRfKG9FoOmeZTEwz+L/zJCwIDAQAB',
  invalidKey: mismatchedPublicKey
};