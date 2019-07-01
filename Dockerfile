FROM circleci/node:11.10.0

COPY vault.crt /usr/local/share/ca-certificates/
RUN apk add --no-cache ca-certificates
RUN	update-ca-certificates

USER root

#WORKDIR /build

ADD . .

RUN npm ci