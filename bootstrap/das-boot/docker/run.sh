#/bin/bash

sudo rm -rf ../target/logs
mkdir -p ../target/logs
sudo chown root:admin ../target/logs
sudo chmod 777 ../target/logs

docker run -it --user=deployer -p 8080:8080 -p 8084:8084 --env-file ../docker/env.list \
	 -v /Users/viliusl/Projects/node/server-platform-js/bootstrap/das-boot/target/logs:/logs \
	 -v /Users/viliusl/Projects/node/server-platform-js/bootstrap/das-boot/docker/configs:/configs \
	  docker-repo.wixpress.com/com.wixpress.npm.das-boot:snapshot