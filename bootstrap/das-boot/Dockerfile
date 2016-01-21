FROM docker-repo.wixpress.com/com.wixpress.npm.wix-bootstrap:snapshot
MAINTAINER Vilius Lukosius <vilius@wix.com>

# add config templates - *.erb
ADD templates/* /templates/

# add all app assets - .dockerignore excludes heavy stuff (node_modules, target).
ADD * /app/

# install deps
RUN npm install --production

# switch to unprivileged user to run your app
USER deployer

# given /app/index.js exists
CMD node index.js