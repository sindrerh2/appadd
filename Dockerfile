FROM circleci/node:11.10.0

USER root
COPY vault.pem /usr/share/local/ca-certificates
RUN update-ca-certificates

#WORKDIR /build

ADD . .

RUN npm ci
