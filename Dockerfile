FROM circleci/node:11.10.0

USER root
ADD vault.pem /usr/local/share/ca-certificates
RUN ls -la /usr/local/share/ca-certificates
RUN update-ca-certificates

#WORKDIR /build

ADD . .

RUN export NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/vault.pem; npm ci
