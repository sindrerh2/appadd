FROM node:12-alpine

#USER root
COPY vault.pem /usr/share/local/ca-certificates
#RUN update-ca-certificates

#WORKDIR /build

ADD . .

RUN export NODE_EXTRA_CA_CERTS=/usr/share/local/ca-certificates; npm ci
