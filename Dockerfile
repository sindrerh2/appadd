FROM node:10-alpine

#USER root
RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*
ADD vault.pem /usr/local/share/ca-certificates
RUN ls -la /usr/local/share/ca-certificates
RUN update-ca-certificates

#WORKDIR /build

ADD . .

RUN export NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/vault.pem; npm ci
