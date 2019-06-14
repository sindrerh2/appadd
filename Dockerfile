FROM circleci/node:11.10.0

WORKDIR /build

ADD . .

RUN npm ci