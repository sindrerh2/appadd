FROM circleci/node:11.10.0

ADD . .

RUN whoami

RUN ls -la

RUN pwd
RUN cd ~
RUN pwd

#RUN sudo chown -R $(whoami) /node_modules

RUN npm install --loglevel=warn password-generator
RUN npm install --loglevel=warn request
RUN npm install --loglevel=warn dotenv
RUN npm install --loglevel=warn js-yaml
RUN npm install --loglevel=warn fs

#ENTRYPOINT ["src/addapp.js"] 