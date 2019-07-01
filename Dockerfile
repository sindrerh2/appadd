FROM circleci/node:11.10.0

USER root
COPY vault.crt /usr/local/share/ca-certificates/

#WORKDIR /build

ADD . .

RUN export NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/vault.crt;npm ci
