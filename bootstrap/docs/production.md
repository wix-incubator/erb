# Production/node server

Given you deploy your server to production, you have to be ready to inspect/debug deployed application. For this you need at least several things:
<!-- ⛔️ AUTO-GENERATED-CONTENT:START (TOC) -->
- [ssh to server](#ssh-to-server)
- [viewing app logs in production](#viewing-app-logs-in-production)
- [inspecting app in production](#inspecting-app-in-production)
- [restart dockerized app](#restart-dockerized-app)
- [monitoring setup](#monitoring-setup)
- [list of things you can check if you can't ssh to production servers](#list-of-things-you-can-check-if-you-cant-ssh-to-production-servers)
- [run chef client manually](#run-chef-client-manually)
<!-- ⛔️ AUTO-GENERATED-CONTENT:START (TOC) -->
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->
 
## ssh to server
 It's crucial to have ssh access to production machines BEFORE going to production. Because if smth goes sideways, you will have no way to inspect configuration, logs, docker output.
 
  - First you have to [upload your ssh keys to chef](https://kb.wixpress.com/display/hoopoe/Create+SSH+keys+for+Production+and+GitHub);
  - Then you have to wait for at least 1 hour and try to ssh to machine like:
  
```bash
ssh {yourUser}@docker01.aus.wixpress.com -p 41278
```

where `yourUser` is value from `id` field in [https://chef-user-manager.wixpress.com/chef_users](https://chef-user-manager.wixpress.com/chef_users/). If it still does not work, open an issue in [PROD project](https://jira.wixpress.com/browse/PROD/)

Once you can connect, add your app to some servers, GA and wait for email. If all is good - move on, else follow to next section.

## viewing app logs in production

stdout/stderr of an app is written to files in folder per app that is `/var/log/${artifact}/{stdout|stderr}.log` like:

```bash
vilius@docker04:/var/log/com.wixpress.npm.das-boot-ng$ ls -lah
total 60K
drwxrwxrwx   2 root     root  4.0K Apr 11 07:01 .
drwxr-xr-x 392 root     root   40K Apr 11 05:21 ..
-rw-r--r--   1 deployer sensu 1.7K Apr 11 07:02 newrelic_agent.log
-rw-r--r--   1 deployer sensu 3.1K Apr 11 07:01 stderr.log
-rw-r--r--   1 deployer sensu    2 Apr 11 07:01 stdout.log
```

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

Also you can find:
 - configs in `/opt/wix/com.wixpress.npm.das-boot-ng/etc/`;
 - logs if any in `/var/log/com.wixpress.npm.das-boot-ng/`;

## restart dockerized app

If for some reason you need to restart your app in production, you should run on server:

```bash
sudo systemctl restart {artifact-id}
```
 
 ## monitoring setup

Every app has new-relic enabled. After you successfully deployed your app to production, after 10-15 minutes of initial traffic your app should appear in new-relic and you can look it up by module name in `package.json` - https://rpm.newrelic.com/accounts/23428/applications

Not that ** IT IS YOUR RESPONSIBILITY ** to set-up alerts for your app so that you would be notified if something breaks.

## list of things you can check if you can't ssh to production servers

1. Make sure you have your ssh public key added in [chef user manager](https://chef-user-manager.wixpress.com/chef_users/). 

If you just added it - wait:) System team should approve your key and then it should be uploaded to production servers, which usually takes ~15mins.
If it's urgent and you don't have time to wait - contact [system team in slack](https://wix.slack.com/messages/system/).

2. Make sure you're using correct user id and specified port when you're doing ssh.
Correct command is:
```bash
ssh {yourUser}@docker01.aus.wixpress.com -p 41278
```
where `yourUser` is value from `id` field in [https://chef-user-manager.wixpress.com/chef_users](https://chef-user-manager.wixpress.com/chef_users/).

3. If you're getting "Permission denied" error:
```bash
cat ~/.ssh/id_rsa.pub
```

```bash
ssh-keygen -y -f ~/.ssh/id_rsa
```

Make sure both of these commands return you the same key and this key is the key you have in [chef user manager](https://chef-user-manager.wixpress.com/chef_users/). 
If it's not - update user manager with correct key and wait 15 mins.

4. If it still does not work, open an issue in [PROD project](https://jira.wixpress.com/browse/PROD/)

## run chef client manually

After you ssh to server run:
```bash
sudo run-chef.sh

##or

sudo /opt/limited-scripts/run-chef.sh
 ```
