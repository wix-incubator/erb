FROM docker-repo.wixpress.com/com.wixpress.wix-node:snapshot
MAINTAINER Vilius Lukosius <vilius@wix.com>

USER root

# add bootstrap configs
COPY node_modules/wix-bootstrap-config/templates /templates/
RUN chown -R deployer:deployer /templates

USER deployer