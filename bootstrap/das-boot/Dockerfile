FROM docker-repo.wixpress.com/com.wixpress.npm.wix-bootstrap:snapshot
MAINTAINER Vilius Lukosius <vilius@wix.com>

ADD templates/* /templates/

# add package.json and npm-shrinkwrap.json if available
ADD *.json /app/

# install deps
RUN npm install --production

# add app assets - /app is designated folder for you app
RUN mkdir /app/lib
ADD lib /app/lib/
ADD *.js /app/

# switch to unpriviledged user to run your app
USER deployer

# given /app/index.js exists
CMD node index.js