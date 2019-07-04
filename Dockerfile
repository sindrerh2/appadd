#FROM circleci/node:11.10.0
FROM node:12-alpine

USER root
#RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*
#ADD *.pem /usr/local/share/ca-certificates/
#RUN ls -la /usr/local/share/ca-certificates
#RUN update-ca-certificates

#WORKDIR /build

ADD . .

#RUN export NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates; npm ci
RUN npm ci
