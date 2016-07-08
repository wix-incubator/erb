# Production/node server

Given you deploy your server to production, you have to be ready to inspect/debug deployed application. For this you need at least several things:
 - [ssh access to production servers and inspection of running containers](ssh-to-server);
 - [monitoring (new-relic)](monitoring-setup).
 
## ssh to server
 It's crucial to have ssh access to production machines BEFORE going to production. Because if smth goes sideways, you will have no way to inspect configuration, logs, docker output.
 
  - First you have to [upload your ssh keys to chef](https://kb.wixpress.com/display/hoopoe/Create+SSH+keys+for+Production+and+GitHub);
  - Then you have to wait for at least 1 hour and try to ssh to machine like:
  
```bash
ssh {yourUser}@docker01.aus.wixpress.com -p 41278
```

where `yourUser` is value from `id` field in [https://chef-user-manager.wixpress.com/chef_users](https://chef-user-manager.wixpress.com/chef_users/). If it still does not work, open an issue in [PROD project](https://jira.wixpress.com/browse/PROD/)

Once you can connect, add your app to some servers, GA and wait for email. If all is good - move on, else follow to next section.

## inspecting app in production

Let's say we want to inspect [das-boot-ng](https://fryingpan.wixpress.com/services/com.wixpress.npm.das-boot-ng) app.

First 

```sh
ssh {yourUser}@docker01.aus.wixpress.com -p 41278
```

you can do `sudo docker ps` to see running containers, find yours like:

```
513cc7fbf8ce        docker-repo.wixpress.com/com.wixpress.npm.das-boot-ng:latest-1.19.0                "/bin/sh -c 'node ind"   8 days ago          Up 8 days           0.0.0.0:26620->8080/tcp, 0.0.0.0:26624->8084/tcp                      com.wixpress.npm.das-boot-ng
```

where at the end you can see that app has stable alias `com.wixpress.npm.das-boot-ng` that does not change between deployments.

** substitute `com.wixpress.npm.das-boot-ng` with your artifact ${groupId}${artifactId} in following examples **

Try out following commands:
 - `sudo docker inspect` - different metadata about your container;
 - `sudo docker logs -f com.wixpress.npm.das-boot-ng` - show container stdout/err logs. Works also for stopped containers (last run);

Also you can find:
 - configs in `/opt/wix/com.wixpress.npm.das-boot-ng/etc/`;
 - logs if any in `/var/log/com.wixpress.npm.das-boot-ng/`;

 
 ## monitoring setup

Every app has new-relic enabled. After you successfully deployed your app to production, after 10-15 minutes of initial traffic your app should appear in new-relic and you can look it up by module name in `package.json` - https://rpm.newrelic.com/accounts/23428/applications

Not that ** IT IS YOUR RESPONSIBILITY ** to set-up alerts for your app so that you would be notified if something breaks.
