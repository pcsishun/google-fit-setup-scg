# using node version 17 with alpine os
FROM node:17.8-alpine

# add tini & create app folder
RUN  mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm install
COPY . .

# EXPOSE 8333

CMD ["node", "server.js"]