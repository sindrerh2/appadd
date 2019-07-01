FROM circleci/node:11.10.0

USER root
COPY vault.crt /usr/local/share/ca-certificates/
RUN	update-ca-certificates
RUN openssl s_client -connect vault.adeo.no:443

#WORKDIR /build

ADD . .

RUN NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/vault.crt;npm ci
