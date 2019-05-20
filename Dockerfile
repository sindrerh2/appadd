FROM circleci/node:11.10.0

ADD . .

RUN npm install
#COPY . .

RUN ls -la src

ENTRYPOINT ["node", "src/addapp.js"]