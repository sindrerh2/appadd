FROM circleci/node:11.10.0

USER root
COPY vault.pem /usr/share/local/ca-certificates
RUN chmod 644 /usr/local/share/ca-certificates/vault.pem
RUN update-ca-certificates

#WORKDIR /build

ADD . .

RUN export NODE_EXTRA_CA_CERTS=/usr/share/local/ca-certificates; npm ci
