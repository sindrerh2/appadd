FROM circleci/node:11.10.0

ADD . .

RUN npm ci
#COPY . .

RUN ls -la src

ENTRYPOINT ["node", "src/addapp.js"]