FROM circleci/node:11.10.0

ADD . .

USER root

COPY vault.crt /usr/local/share/ca-certificates/
#RUN apk add --no-cache ca-certificates
RUN	update-ca-certificates

#WORKDIR /build

RUN npm ci