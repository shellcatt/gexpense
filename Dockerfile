FROM node:18-bullseye-slim AS base

RUN apt-get -y update
RUN apt-get -y install curl unzip 

# Install NPM 
RUN curl -L https://www.npmjs.com/install.sh | sh
RUN npm cache clean --force 

WORKDIR /app
ENTRYPOINT [ "/init/entrypoint.sh" ]

FROM base AS dev
# Dev tools
RUN apt-get install -y watch
RUN npm install -g nodemon
RUN curl https://gist.githubusercontent.com/wstierhout/df31e50420c598f519cb3c4be5927e63/raw/7b0f13db7d51827157d3259b3b1efba8a0c10152/.bashrc \
    > /home/node/.bashrc

USER node

FROM base AS prod
# ENTRYPOINT [ "tail", "-f", "/dev/null" ]


