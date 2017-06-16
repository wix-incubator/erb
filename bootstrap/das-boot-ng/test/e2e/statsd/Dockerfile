FROM docker-repo.wixpress.com/wix-node:6
MAINTAINER Vilius Lukosius <vilius@wix.com>

ENV DEBUG="wix:*"

USER root

COPY . /app/

RUN rm -rf /app/node_modules /app/target && \
    chown -R deployer:deployer /templates && \
    chown -R deployer:deployer /app

USER deployer

RUN npm install --production

CMD ["/app/entrypoint.js"]
