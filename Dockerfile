FROM circleci/node:11.10.0

USER root
ENV  NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/vault.crt
COPY vault.crt /usr/local/share/ca-certificates/
RUN	update-ca-certificates

#WORKDIR /build

ADD . .

RUN npm ci
