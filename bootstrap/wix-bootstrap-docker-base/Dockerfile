FROM docker-repo.wixpress.com/com.wixpress.wix-node:snapshot
MAINTAINER Vilius Lukosius <vilius@wix.com>

USER root

# add bootstrap configs and fix permissions
COPY templates /templates/
RUN chown -R deployer:deployer /templates

USER deployer

ENV DEBUG="wnp:*,wix:*"
ENV APP_PERSISTENT_DIR="/persistent"