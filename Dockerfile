FROM node:12-alpine

ADD . .

RUN npm ci
