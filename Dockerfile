FROM circleci/node:11.10.0

ADD . .

RUN npm ci