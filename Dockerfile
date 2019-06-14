FROM circleci/node:11.10.0

USER root

#WORKDIR /build

ADD . .

RUN npm ci