FROM node:11-alpine

ADD . .

RUN npm ci

ENTRYPOINT [".src/appadd.js"]