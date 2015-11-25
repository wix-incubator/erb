'use strict';
const fork = require('child_process').fork;

module.exports.withApp = (app, params, env, promise) => {
  return () => {
    let instance = new EmbeddedApp(app, params, env);
    return new Promise((fulfill, reject) => instance.start(fulfill, reject))
      .then(() => promise(instance))
      .then((res) => {
        return new Promise((fulfill) => instance.stop(() => {
          instance = undefined;
          fulfill(res);
        }));
      }, (err) => {
        return new Promise((fulfill, reject) => instance.stop(() => {
          instance = undefined;
          reject(err);
        }));
      } );
  };
};

function EmbeddedApp(app, params, env) {
  var workerCount = env.workerCount || 1;
  var spawnedWorkerCount = 0;
  var events = [];
  let childDiedHandler;
  let childDidDie = false;

  function childDied() {
    childDiedHandler();
    childDidDie = true;
  }

  this.start = (done, reject) => {
    let timer = setTimeout(() => {
      if (this.child) {
        this.child.kill();
      }
      reject(new Error(`Timeout trying to initialize app [${app}].
       Failed to recieve the listening signal within 1 second.
       Did you remember to include the testNotifierPlugin in your cluster builder?`));
    }, 4000);
    childDiedHandler = () => {
      clearTimeout(timer);
      reject(new Error('Child process unexpectedly died during initialization.\n' +
       '       The listening signal was not received.'));
    };
    this.child = fork(app, params, {env: env});


    this.child.on('exit', () => {
      childDied();
    });

    this.child.on('message', (evt) => {
      events.push(evt);

      if (evt.event === 'listening') {
        spawnedWorkerCount += 1;
        if (spawnedWorkerCount === workerCount) {
          clearTimeout(timer);
          childDiedHandler = () => {};
          done();
        }
      }
    });
  };

  this.stop = (done) => {
    if (childDidDie) {
      done();
    }
    else {
      childDiedHandler = done;
      this.child.kill();
    }
  };

  this.getEvents = ()=> {
    return events;
  };
}