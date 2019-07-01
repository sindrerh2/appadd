FROM circleci/node:11.10.0

USER root
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/vault.crt
COPY vault.crt /usr/local/share/ca-certificates/
COPY vault.crt /etc/ssl/certs/
RUN	update-ca-certificates
RUN openssl s_client -connect vault.adeo.no:443

#WORKDIR /build

ADD . .

RUN npm ci
