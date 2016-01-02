#!/usr/bin/env bash

export APP_NAME=com.wixpress.npm.das-boot
export MOUNT_POINT=
export PORT=3000
export MANAGEMENT_PORT=3004
export APP_LOG_DIR=`pwd`/logs/
export APP_CONF_DIR=`pwd`/test/configs/

TAG="docker-repo.wixpress.com/com.wixpress.npm.das-boot:snapshot"
#TAG="docker-repo.wixpress.com/com.wixpress.npm.das-boot:snapshot-1.0.0-20151217.200912-23"

#docker build --no-cache=true -t ${TAG} .

docker run \
        -dp ${PORT}:${PORT} -dp ${MANAGEMENT_PORT}:${MANAGEMENT_PORT} \
        -e PORT=${PORT} -e MOUNT_POINT=${MOUNT_POINT} -e MANAGEMENT_PORT=${MANAGEMENT_PORT} -e APP_NAME=${APP_NAME} \
        -v ${APP_CONF_DIR}:/configs -v ${APP_LOG_DIR}:/logs \
        ${TAG} ; docker logs -f `docker ps | grep ${TAG} | awk '{print $1}'`