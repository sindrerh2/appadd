FROM circleci/node:11.10.0

USER root

COPY vault2.crt /usr/local/share/ca-certificates/
#RUN apk add --no-cache ca-certificates
RUN	update-ca-certificates

#WORKDIR /build

ADD . .

RUN npm ci