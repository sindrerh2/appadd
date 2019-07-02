FROM pionl/node-with-openssl:10-alpine

USER root
COPY vault.crt /etc/ssl/certs/

#WORKDIR /build

ADD . .

RUN npm ci
