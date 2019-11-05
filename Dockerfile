#KBZ @ vf-OS project
#David Aleixo david.aleixo@knowledgebiz.pt
# Dockerfile for a node container

#nodejs
FROM node:6

#Maintainer
LABEL description="Configuration Enabler" 
LABEL maintainer="david.aleixo@knowledgebiz.pt"

# configuration enabler directory
RUN mkdir -p /usr/src/ce
# this lets the working directory for every COPY RUN and CMD command
WORKDIR /usr/src/ce

# get the node package file
# wildcard used to ensure both package.json and package-lock.json are copied
COPY package*.json /usr/src/ce
COPY bower.json /usr/src/ce
COPY .bowerrc /usr/src/ce
# install dependencies
RUN npm install -g bower
RUN npm install
RUN bower install --allow-root

COPY . .

# expose the configuration enabler port
EXPOSE 3000

CMD [ "npm", "start" ]




