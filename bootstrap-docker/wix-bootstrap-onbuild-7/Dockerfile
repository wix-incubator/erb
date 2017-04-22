FROM docker-repo.wixpress.com/wix-node:7
MAINTAINER Vilius Lukosius <vilius@wix.com>

# set spjs debug environment variables
ENV DEBUG="wix:*"

# enable express metrics (feature toggle)
ENV ENABLE_EXPRESS_METRICS true
ENV ENABLE_RPC_METRICS true

USER root

# copy .npmrc with ci permissions to container for npm install would work with ex. @wix scoped packages
COPY .npmrc /home/deployer/.npmrc

# custom entrypoint for log redirection
COPY entrypoint.sh /opt/entrypoint.sh

# set correct permissions for /home/deployer/.npmrc
RUN chown deployer:deployer /home/deployer/.npmrc && chmod 0600 /home/deployer/.npmrc

# add config templates - *.erb
ONBUILD COPY templates /templates/

# add all app assets - .dockerignore excludes heavy stuff (node_modules, target).
ONBUILD COPY . /app/

# clean node_modules if developer forgot to add '.dockerignore'
# fix permissions of added files.
ONBUILD RUN rm -rf /app/node_modules /app/target && \
    chown -R deployer:deployer /templates && \
    chown -R deployer:deployer /app

ONBUILD USER deployer

# install deps
ONBUILD RUN npm install --production
# install new relic sys metrics collection lib. Have to do it here so that it's at root of node_modules and new relic discovers it
ONBUILD RUN npm install @newrelic/native-metrics

# rm .npmrc so it would not be in prod artifact
ONBUILD RUN rm /home/deployer/.npmrc

ONBUILD CMD ["/opt/entrypoint.sh"]
