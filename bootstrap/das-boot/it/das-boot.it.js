'use strict';
const Sokoban = require('sokoban'),
  execSync = require('child_process').execSync;


describe('das-boot', () => {
  const sokoban = new Sokoban();

  before(() => {
    execSync('docker build --pull=true --tag=das-boot:local .');
    sokoban.run({imageName: "das-boot:local",
      containerName: 'app',
      volumes: {
        "./logs": "/logs",
        "./config": "/config"
      },
      env: {
        DB_NAME: "gitlabhq_production",
        DB_USER: "gitlab",
        DB_PASS: "password"}})
  });

  after(() => sokoban.killAll());

  it('should work', () => {

  });

});